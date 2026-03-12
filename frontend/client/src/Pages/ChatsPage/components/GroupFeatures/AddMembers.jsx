import {useEffect, useState} from "react";
import {chatsService} from "@/api/chatsService.js";
import styles from "./GroupDetails.module.scss"
import Avvvatars from "avvvatars-react";
import UserStatus from "@/Pages/ChatsPage/components/ChatWindow/UserStatus.jsx";
import {ChevronLeft, X, LoaderCircle} from "lucide-react";

function AddMembers({chatId, setIsAddingMembers, setIsOpen}) {
  const [defaultUsers, setDefaultUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = "http://localhost:5000";
  useEffect(() => {
    const fetchDefaultUsers = async () => {
      setIsLoading(true);
      try {
        const res = await chatsService.getRecentUsers();
        setDefaultUsers(res);
        console.log(res)
      } catch (err) {
        console.error("Error to fetch user list", err)
      } finally {
        setIsLoading(false);
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

  const handleUserClick = (user) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadyAdded = prevSelected.some((u) => u.id === user.id)
      if (isAlreadyAdded) {
        return prevSelected;
      }
      return [...prevSelected, user]
    });
    setQuery("");
    console.log(selectedUsers)
  }
  const handleBack = () => {
    setIsAddingMembers(false)
    setSelectedUsers([]);
  }
  const handleRemoveUser = (userIdToRemove) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.filter((user) => user.id !== userIdToRemove)
    );
  }
  const handleAddUsers = async () => {
    const membersIds = selectedUsers.map(users => users.id);
    try {
      await chatsService.addGroupMember(chatId, membersIds)
      setIsOpen(false);
    } catch (err) {
      console.error("Error with adding users", err)
    }
  }

  return (
    <>
      <ChevronLeft
        onClick={handleBack}
        className={styles.backbtn}/>
      <div className={styles.addusersheader}>
        <h4 className={styles.creategrouptitle}>Add members</h4>
        <input
          type="text"
          name={"userSearch"}
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
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
      </div>
      <div className={styles.searchusers}>
        {isLoading ? (
          <div className={styles.loader}></div>
        ) : (
          <>
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
          </>
        )}
      </div>
      <div className={styles.addbtnblock}>
        <button
          onClick={handleAddUsers}
          className={styles.addmembers}>
          Add
        </button>
      </div>
    </>
  )
}

export default AddMembers;