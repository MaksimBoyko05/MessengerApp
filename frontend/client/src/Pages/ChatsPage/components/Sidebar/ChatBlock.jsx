import styles from "../../Chats.module.scss";
import Avvvatars from 'avvvatars-react'
import {CheckCheck, Check} from 'lucide-react';
import UserContext from "@/context/UserContext.jsx"
import {useContext} from "react";

function ChatBlock({chat, onClick, isActive}) {
  const {user} = useContext(UserContext);
  const API_URL = "http://localhost:5000";
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    hour: 'numeric',
    minute: 'numeric'
  });
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
      <p className={styles.msgtime}>{formatter.format(new Date(chat.last_message_time))}</p>

      {chat.unread_count > 0 ? (
        <>
          <div className={styles.unreadcount}>
            {chat.unread_count}
          </div>
        </>
      ) : (
        chat.last_message_author_id === user.id && (
          <div className={styles.ticks}>
            {chat.is_last_message_read ? (
              <CheckCheck
                size={16}
                color={"#1f52db"}
                className={styles.readIcon}/>
            ) : (
              <Check
                size={16}
                color={"#626262"}
                className={styles.sentIcon}/>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default ChatBlock;