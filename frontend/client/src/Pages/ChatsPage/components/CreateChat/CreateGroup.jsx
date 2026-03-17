import styles from "./CreateChat.module.scss"
import {useEffect, useState} from "react";
import {chatsService} from "@/api/chatsService.js";
import {ChevronLeft, X} from 'lucide-react';
import Avvvatars from "avvvatars-react";
import UserStatus from "@/Pages/ChatsPage/components/ChatWindow/UserStatus.jsx";

function CreateGroup({onClose, defaultUsers}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const API_URL = "http://localhost:5000";
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("")

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
  }, [query]);

  const handleUserClick = (user) => {
    setSelectedUsers([...selectedUsers, user])
    setQuery("");
  }

  const handleCreateGroup = async () => {
    const memberIds = selectedUsers.map(user => user.id);
    try {
      const newGroup = await chatsService.createGroup(groupName, memberIds);
      console.log("Групу успішно створено!", newGroup);
    } catch (err) {
      console.error("Error:", err)
    }
  }
  const handleRemoveUser = (userIdToRemove) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.filter((user) => user.id !== userIdToRemove)
    );
  }
  const handleClose = () => {
    setSelectedUsers([])
    onClose(false)
  }

  return (
    <>
      <ChevronLeft
        onClick={handleClose}
        className={styles.backbtn}/>
      <div className={styles.modalheader}>
        <h4 className={styles.creategrouptitle}>New Group</h4>
        <span>Create a new group</span>
        <input
          type={"text"}
          placeholder={"Name the group"}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}/>
      </div>
      <div className={styles.selecteduserscontainer}>
        {selectedUsers.map(user => (
          <div
            key={user.id}
            className={styles.selecteduser}>
            {user.avatar_url === null ? (
              <Avvvatars value={user.name}/>
            ) : (
              <img
                alt={user.username}
                src={`${API_URL}${user.avatar_url}`}/>
            )}
            <span>{user.username}</span>
            <X
              className={styles.removeuser}
              size={12}
              onClick={() => handleRemoveUser(user.id)}/>
          </div>
        ))}
      </div>
      <div className={styles.searchusers}>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {users.map(user => (
          <div
            key={user.id}
            className={styles.userblock}
            onClick={() => handleUserClick(user)}
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
        <button
          className={styles.createGroup}
          onClick={handleCreateGroup}>Create
        </button>
      </div>
    </>
  )
}

export default CreateGroup;