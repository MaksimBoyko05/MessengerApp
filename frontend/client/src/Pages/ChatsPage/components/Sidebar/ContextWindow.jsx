import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Trash, UserStar} from 'lucide-react';
import {chatsService} from "@/api/chatsService.js";
import {useContext} from "react";
import {ChatContext} from "@/context/ChatContext.jsx";

function ContextWindow({x, y, handleDelete, type, chatId, targetId}) {
  const menuHeight = 135;
  const menuWidth = 150;
  const isOutBelow = y + menuHeight > window.innerHeight;
  const isOutSidebar = x + menuWidth > 340;
  const left = isOutSidebar ? x - menuWidth : x;
  const top = isOutBelow ? y - menuHeight : y;

  const {chatDetails, setChatDetails} = useContext(ChatContext)

  const handlePromote = async () => {
    console.log(chatId, targetId)
    try {
      setChatDetails({
        ...chatDetails,
        members: chatDetails.members.map(member => {
          return member.id === targetId
            ? {...member, role: "admin"}
            : member
        })
      })
      await chatsService.promoteAdmin(chatId, targetId)
    } catch (err) {
      console.error("Error with promote to admin", err)
    }
  }
  return (
    <div
      style={{top: top + 'px', left: left + 'px', position: "fixed"}}>
      <div className={styles.contextmenu}>
        {type === "chatList" && (
          <>
            <p>Placeholder1</p>
            <p>Placeholder2</p>
            <p
              className={styles.delete}
              onClick={() => handleDelete(false)}><Trash size={16}/>Видалити у мене</p>
            <p
              className={styles.delete}
              onClick={() => handleDelete(true)}><Trash size={16}/>Видалити для всіх</p>
          </>
        )}
        {type === "group" && (
          <div className={styles.groupmenu}>
            <p
              className={styles.makeadmin}
              onClick={handlePromote}>Promote as Admin <UserStar size={16}/></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContextWindow;