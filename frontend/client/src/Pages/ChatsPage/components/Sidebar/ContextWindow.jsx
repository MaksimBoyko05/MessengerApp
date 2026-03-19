import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Trash, UserStar, StarOff} from 'lucide-react';
import {chatsService} from "@/api/chatsService.js";
import {useContext} from "react";
import {ChatContext} from "@/context/ChatContext.jsx";
import UserContext from "@/context/UserContext.jsx";

function ContextWindow({x, y, handleDelete, type, chatId, targetId, containerHeight, containerWidth, closeMenu}) {
  const menuHeight = 135;
  const menuWidth = 150;
  const isOutBelow = y + menuHeight > containerHeight;
  const isOutRight = x + menuWidth > containerWidth;
  const left = isOutRight ? x - menuWidth : x;
  const top = isOutBelow ? y - menuHeight : y;

  const {chatDetails, setChatDetails} = useContext(ChatContext) || {};
  const {user} = useContext(UserContext) || {};

  const currentUser = chatDetails?.members?.find(member => Number(member.id) === Number(user?.id));
  const isUserAdmin = (targetId) => {
    const targetUser = chatDetails?.members?.find(
      (member) => Number(member.id) === Number(targetId)
    );
    return targetUser?.role === "admin";
  };

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
  const handleUnPromote = async () => {
    console.log(chatId, targetId)
    try {
      setChatDetails({
        ...chatDetails,
        members: chatDetails.members.map(member => {
          return member.id === targetId
            ? {...member, role: "member"}
            : member
        })
      })
      await chatsService.promoteMember(chatId, targetId)
    } catch (err) {
      console.error("Error with promote to admin", err)
    }
  }


  const handleOpenPrivateChat = async () => {
    try {
      const chatData = await chatsService.createOrOpenChat(targetId);
      const event = new CustomEvent('forceOpenChat', {detail: chatData});
      window.dispatchEvent(event);
    } catch (err) {
      console.error(err);
    }
  }
  const handleDeleteMember = async () => {
    console.log(chatId, targetId)
    try {
      await chatsService.deleteMember(chatId, targetId)
    } catch (err) {
      console.error("Error when deleting user", err)
    }
  }
  const handleDeleteMessage = async () => {
    console.log("Click delete")
    try {
      await chatsService.deleteMessage(targetId)
      closeMenu();
    } catch (err) {
      console.error("Error with deleting msg", err)
    }
  }
  const isTargetUserAdmin = isUserAdmin(targetId);
  return (
    <div
      style={{top: top + 'px', left: left + 'px', position: "absolute", zIndex: 100}}
      onClick={(e) => e.stopPropagation()}>
      <div className={styles.contextmenu}>
        {type === "chatList" && (
          <>
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
            <p onClick={handleOpenPrivateChat}>Написати в ПП</p>
            {currentUser?.role === "admin" && (
              <>
                {isTargetUserAdmin ? (
                  <p onClick={handleUnPromote}>Зняти адмін права <StarOff size={16}/></p>
                ) : (
                  <p
                    className={styles.makeadmin}
                    onClick={handlePromote}>Зробити Адміном <UserStar size={16}/>
                  </p>
                )}
                <p
                  style={{color: "#f61e1e"}}
                  onClick={handleDeleteMember}>Видалити користувача</p>
              </>
            )}
          </div>
        )}
        {type === "message" && (
          <div>
            <p onClick={handleDeleteMessage}>Видалити повідомлення</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContextWindow;