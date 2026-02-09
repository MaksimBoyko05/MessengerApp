import styles from "@/Pages/ChatsPage/Chats.module.scss";
import UserStatus from "./UserStatus.jsx"

function ChatHeader({companion}) {
  const API_URL = "http://localhost:5000";


  return (
    <>
      <div className={styles.chatheaderwrapper}>
        <img
          alt={"profile_img"}
          src={`${API_URL}${companion?.avatar_url}`}/>
        <div className={styles.headertext}>
          <p>{companion?.username}</p>
          <UserStatus
            isOnline={companion?.is_online}
            lastSeen={companion?.last_seen}/>
        </div>
      </div>
    </>
  )
}

export default ChatHeader;