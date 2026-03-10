import {UserContext} from "@/context/UserContext.jsx";
import {useContext} from "react";
import {CheckCheck, Check} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from "@/Pages/ChatsPage/Chats.module.scss";


function ChatMessages({isGroup, msg}) {
  const {user} = useContext(UserContext);
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    hour: 'numeric',
    minute: 'numeric'
  });
  const API_URL = "http://localhost:5000";
  const SENDER_COLORS = ['#7c3aed', '#db2777', '#059669', '#d97706'];

  function getSenderColor(name) {
    const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return SENDER_COLORS[hash % SENDER_COLORS.length];
  }

  const getMessagesClass = (msg) => {
    if (msg.type === "system") {
      return styles.system
    }
    if (msg.type === "ai") {
      return styles.isAi
    }
    return msg.user_id === user.id ? styles.mymsg : styles.msgbubble
  }

  return (
    <>
      {msg.user_id !== user.id && (
        <div className={styles.senderimg}>
          <img
            alt="memberimg"
            src={`${API_URL}${msg.sender_avatar}`}/>
        </div>
      )}

      <div className={getMessagesClass(msg)}>
        {msg.user_id !== user.id && (
          isGroup && (
            <p
              className={styles.sendername}
              style={{color: getSenderColor(msg.sender_name)}}>{msg.sender_name}</p>
          )
        )}
        {msg.is_ai && (
          <p
            className={styles.sendername}
            style={{color: getSenderColor(msg.sender_name)}}>{msg.sender_name}</p>
        )}
        <div className={styles.markdownContent}>
          <ReactMarkdown children={msg.text}/>
        </div>
        {msg.type !== "system" && (
          <div className={styles.readtime}> {formatter.format(new Date(msg.created_at))}</div>)}
        {msg.type !== "system" && (
          msg.user_id === user.id && (

            msg.is_read ? (
              <CheckCheck size={16}/>
            ) : (
              <Check size={16}/>
            )
          )
        )}
      </div>
    </>
  )
}

export default ChatMessages;