import {useState, useEffect} from "react";
import Avvvatars from 'avvvatars-react'
import {chatsService} from "@/api/chatsService.js";
import {X} from 'lucide-react';
import styles from "./CreateChat.module.scss"
import CreateGroup from "@/Pages/ChatsPage/components/CreateChat/CreateGroup.jsx";
import UserStatus from "@/Pages/ChatsPage/components/ChatWindow/UserStatus.jsx";

function CreateChatModal({setIsOpen, onChatCreated}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [defaultUsers, setDefaultUsers] = useState([]);
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchDefaultUsers = async () => {
      try {
        const res = await chatsService.getRecentUsers();
        setDefaultUsers(res);
        console.log(res)
      } catch (err) {
        console.error("Error to fetch user list", err)
      }
    }
    fetchDefaultUsers();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setUsers(defaultUsers);
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
  }, [query, defaultUsers]);

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
          <X
            className={styles.closebtn}
            size={24}
            onClick={() => setIsOpen(false)}
          />
          {!isCreateGroup && (
            <div className={styles.modalheader}>
              <h4>New Chat</h4>
              <span>Choose someone to message</span>
              <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}
          {isCreateGroup ? (
            <>
              <CreateGroup
                defaultUsers={defaultUsers}
                onClose={setIsCreateGroup}/>
            </>
          ) : (
            <>
              <div className={styles.searchusers}>
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
                    <div className={styles.userdata}>
                      <span>{user.username}</span>
                      <UserStatus
                        isOnline={user.is_online}
                        lastSeen={user.last_seen}/>
                    </div>
                  </div>
                ))}
                {users.length === 0 && query.length > 2 && (
                  <div className={styles.empty}>Нікого не знайдено</div>
                )}
              </div>
              <div className={styles.creategroupblock}>
                <button onClick={() => setIsCreateGroup(true)}>Create group</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default CreateChatModal;