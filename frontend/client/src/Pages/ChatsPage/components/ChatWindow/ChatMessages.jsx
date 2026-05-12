import {UserContext} from "@/context/UserContext.jsx";
import {useContext} from "react";
import {Check, CheckCheck} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import Avvvatars from "avvvatars-react";

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

function ChatMessages({isGroup, msg, onContextMenu}) {
  const {user} = useContext(UserContext);

  const getMessagesClass = (msg) => {
    if (msg.type === "system") {
      return styles.system
    }
    if (msg.type === "ai") {
      return styles.isAi
    }
    return msg.user_id === user.id ? styles.mymsg : styles.msgbubble
  }
  if (msg.is_deleted) {
    return null;
  }
  const isMine = msg.user_id === user.id;
  const isSystem = msg.type === "system";
  const isAi = msg.type === "ai";
  return (
    <>
      {!isMine && (
        !isSystem && !isAi && (
          <div className={styles.senderimg}>
            {msg.sender_avatar ? (
              <img
                alt="memberimg"
                src={`${API_URL}${msg.sender_avatar}`}/>
            ) : (
              <Avvvatars value={msg.sender_name}/>
            )}
          </div>
        )
      )}

      <div
        className={getMessagesClass(msg)}
        onContextMenu={onContextMenu}>
        {msg.user_id !== user.id && (
          isGroup && !isSystem && !isAi ? (
            <p
              className={styles.sendername}
              style={{color: getSenderColor(msg.sender_name)}}>{msg.sender_name}</p>
          ) : (
            <></>
          )
        )}
        {isAi && (
          <p
            className={styles.sendername}
            style={{color: getSenderColor(msg.sender_name)}}>
            {msg.sender_name.split(' ')[0]}
          </p>
        )}
        <div className={styles.markdownContent}>
          <ReactMarkdown children={msg.text}/>
        </div>
        {!isSystem && (
          <div className={styles.readtime}> {formatter.format(new Date(msg.created_at))}</div>)}
        {!isSystem && (
          isMine && (

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