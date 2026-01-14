import {UserContext} from "@/context/UserContext.jsx";
import {useContext} from "react";
import {CheckCheck, Check} from 'lucide-react';
import styles from "@/Pages/ChatsPage/Chats.module.scss";


function ChatMessages({msg}) {
  const {user} = useContext(UserContext);
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    hour: 'numeric',
    minute: 'numeric'
  });
  return (
    <>
      <div className={msg.user_id === user.id ? styles.mymsg : styles.msgbubble}>{msg.text}
        <div className={styles.readtime}> {formatter.format(new Date(msg.created_at))}</div>
        {msg.user_id === user.id && (
          msg.is_read ? (
            <CheckCheck size={16}/>
          ) : (
            <Check size={16}/>
          )
        )}
      </div>
    </>
  )
}

export default ChatMessages;