import styles from "./GroupDetails.module.scss"
import {UserRoundPlus, X} from 'lucide-react';
import {ChevronLeft} from 'lucide-react';
import {useEffect, useState, useContext} from "react";
import AddMembers from "@/Pages/ChatsPage/components/GroupFeatures/AddMembers.jsx";
import ContextWindow from "@/Pages/ChatsPage/components/Sidebar/ContextWindow.jsx";
import {ChatContext} from "@/context/ChatContext.jsx";

function GroupDetails({setIsOpen}) {
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [contextMenu, setContextMenu] = useState({
    id: null,
    x: null,
    y: null,
    visible: false,
    type: "",
    chatId: null,
    targetId: null,
  })

  const {chatDetails, setChatDetails} = useContext(ChatContext)
  const members = chatDetails.members;


  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({
        id: null,
        x: null,
        y: null,
        visible: false,
        type: "",
        chatId: null,
        targetId: null,
      });
    };
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);


  const onClose = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  }
  const handleRightClick = (e, id) => {
    e.preventDefault()
    setContextMenu({
      ...contextMenu,
      id: id,
      x: e.clientX,
      y: e.clientY,
      visible: true,
      type: "group",
      chatId: chatDetails.id,
      targetId: id,

    })
  };
  return (
    <>
      <div className={styles.groupdetailswrapper}>
        <div className={styles.detailscontainer}>
          <X
            className={styles.closebtn}
            size={24}
            onClick={onClose}/>
          {isAddingMembers ? (
            <AddMembers
              chatId={chatDetails.id}
              setIsAddingMembers={setIsAddingMembers}/>
          ) : (
            <>
              <div className={styles.groupinfo}>
                <img
                  alt={"groupimg"}
                  src={"https://api.dicebear.com/9.x/glass/svg"}/>
                <p>{chatDetails.name}</p>
                <p>{members.length} Members</p>
              </div>
              <div className={styles.groupmembers}>
                <div onClick={() => setIsAddingMembers(true)}>Add members <UserRoundPlus
                  className={styles.addusericon}
                  size={16}/></div>
                <div className={styles.innerDivider}></div>
                {members.map(member => (
                  <div
                    className={styles.memberslist}
                    key={member.id}
                    onContextMenu={(e) => handleRightClick(e, member.id)}
                  >
                    <p className={styles.username}>{member.username}</p>
                    <p className={member.role === "admin" ? styles.userAdmin : styles.userMember}>{member.role}</p>
                  </div>
                ))}
                {contextMenu.visible && (
                  <>
                    <ContextWindow
                      id={contextMenu.id}
                      x={contextMenu.x}
                      y={contextMenu.y}
                      type={contextMenu.type}
                      chatId={contextMenu.chatId}
                      targetId={contextMenu.targetId}
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default GroupDetails;