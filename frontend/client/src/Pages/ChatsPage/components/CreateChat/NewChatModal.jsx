import {useState, useEffect} from "react";
import Avvvatars from 'avvvatars-react'
import {chatsService} from "@/api/chatsService.js";
import {X} from 'lucide-react';
import styles from "./CreateChat.module.scss"

function CreateChatModal({setIsOpen, onChatCreated}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setUsers([]);
        return;
      }
      try {
        const results = await chatsService.searchUsers(query);
        setUsers(results);
      } catch (error) {
        console.log("Помилка пошуку:", error);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleUserClick = async (userId) => {
    try {
      const chatData = await chatsService.createOrOpenChat(userId);
      onChatCreated(chatData);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className={styles.modalcontainer}>
        <div className={styles.modalcontent}>
          <X onClick={() => setIsOpen(false)}/>
          <input
            type="text"
            placeholder="Пошук користувачів..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div>
            {users.map(user => (
              <div
                key={user.id}
                className={styles.userblock}
                onClick={() => handleUserClick(user.id)}
              >
                {user.avatar_url === null ? (
                  <Avvvatars value={user.name}/>
                ) : (
                  <img
                    alt={user.username}
                    src={`${API_URL}${user.avatar_url}`}/>
                )}
                <span>{user.username}</span>
              </div>
            ))}
            {users.length === 0 && query.length > 2 && (
              <div className={styles.empty}>Нікого не знайдено</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default CreateChatModal;