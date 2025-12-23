import {UserContext} from "../../../context/UserContext.jsx";
import {useContext} from "react";
import styles from "../Chats.module.scss"


function ChatMessages({msg}) {
  const {user} = useContext(UserContext);
  return (
    <>
      <div className={msg.user_id === user.id ? styles.mymsg : styles.msgbubble}>{msg.text}</div>
    </>
  )
}

export default ChatMessages;