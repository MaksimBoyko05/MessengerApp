import styles from "@/Pages/ChatsPage/Chats.module.scss";

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
          <p className={styles.userstatus}>user status</p>
        </div>
      </div>
    </>
  )
}

export default ChatHeader;