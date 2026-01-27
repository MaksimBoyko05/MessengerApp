import styles from "@/Pages/ChatsPage/Chats.module.scss";

function ChatHeader({companion}) {
  const API_URL = "http://localhost:5000";
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    hour: 'numeric',
    minute: 'numeric'
  });
  return (
    <>
      <div className={styles.chatheaderwrapper}>
        <img
          alt={"profile_img"}
          src={`${API_URL}${companion?.avatar_url}`}/>
        <div className={styles.headertext}>
          <p>{companion?.username}</p>
          {companion?.is_online ? (
            <p className={styles.userstatus}>Online</p>
          ) : (
            <p className={styles.lastseen}>{formatter.format(new Date(companion?.last_seen))}</p>
          )}
        </div>
      </div>
    </>
  )
}

export default ChatHeader;