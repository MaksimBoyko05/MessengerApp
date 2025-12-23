import styles from "../Chats.module.scss";

function ChatBlock({chat, onClick}) {
  return (<div
      className={styles.chatblock}
      onClick={() => onClick(chat.id)}>
      <img
        className={styles.chatimg}
        src={chat.avatar_url || '/default-avatar.png'}
        alt={chat.name}
      />
      <div className={styles.chatText}>
        <h4>{chat.name}</h4>
        <p>{chat.last_message || "Немає повідомлень"}</p>
      </div>

      {chat.unread_count > 0 && (<div className={styles.unreadcount}>
          {chat.unread_count}
        </div>)}
    </div>);
}

export default ChatBlock;