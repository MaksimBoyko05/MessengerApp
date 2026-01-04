import styles from "../Chats.module.scss";
import Avvvatars from 'avvvatars-react'

function ChatBlock({chat, onClick, isActive}) {

  const API_URL = "http://localhost:5000";
  return (
    <div
      className={styles.chatblock}
      onClick={() => onClick(chat.id)}
      data-active={isActive}
    >
      {chat.avatar_url ? (
        <img
          alt={chat.name}
          src={`${API_URL}${chat.avatar_url}`}/>
      ) : (
        <Avvvatars value={chat.name}/>
      )}
      <div className={styles.chatText}>
        <h4>{chat.name}</h4>
        <p>{chat.last_message || "Немає повідомлень"}</p>
      </div>

      {chat.unread_count > 0 && (
        <div className={styles.unreadcount}>
          {chat.unread_count}
        </div>
      )}
    </div>
  );
}

export default ChatBlock;