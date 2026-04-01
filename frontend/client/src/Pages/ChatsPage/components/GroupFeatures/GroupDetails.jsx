import styles from "./GroupDetails.module.scss"
import {UserRoundPlus, X} from 'lucide-react';
import {ChevronLeft} from 'lucide-react';
import {useEffect, useState, useContext, useRef} from "react";
import AddMembers from "@/Pages/ChatsPage/components/GroupFeatures/AddMembers.jsx";
import ContextWindow from "@/Pages/ChatsPage/components/Sidebar/ContextWindow.jsx";
import {ChatContext} from "@/context/ChatContext.jsx";
import {Pencil, LogOut} from 'lucide-react';
import EditGroup from "@/Pages/ChatsPage/components/GroupFeatures/EditGroup.jsx";
import {chatsService} from "@/api/chatsService.js";
import UserStatus from "@/Pages/ChatsPage/components/ChatWindow/UserStatus.jsx";
import Avvvatars from "avvvatars-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const {chatDetails, setChatDetails} = useContext(ChatContext)
  const members = chatDetails.members;
  const API_URL = "http://localhost:5000";

  const chatWindowRef = useRef(null);

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
    if (!chatWindowRef.current) return;
    const rect = chatWindowRef.current.getBoundingClientRect();

    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    setContextMenu({
      ...contextMenu,
      id: id,
      x: relativeX,
      y: relativeY,
      containerWidth: rect.width,
      containerHeight: rect.height,
      visible: true,
      type: "group",
      chatId: chatDetails.id,
      targetId: id,

    })
  };
  const handleLeave = async () => {
    try {
      await chatsService.leaveGroup(chatDetails.id)
    } catch (err) {
      console.error("Error with leave a group", err)
    }
  }
  return (
    <>
      <div className={styles.groupdetailswrapper}>
        <div
          className={styles.detailscontainer}
          ref={chatWindowRef}>
          {isEditing ? (
            <EditGroup
              setIsEditing={setIsEditing}
              chatId={chatDetails.id}/>
          ) : (
            <>
              {isAddingMembers ? (
                <AddMembers
                  chatId={chatDetails.id}
                  setIsAddingMembers={setIsAddingMembers}/>
              ) : (
                <>
                  <div className={styles.groupinfo}>
                    {chatDetails.avatar_url ? (
                      <img
                        alt={"groupimg"}
                        src={`${API_URL}${chatDetails.avatar_url}`}/>
                    ) : (
                      <Avvvatars
                        size={42}
                        value={chatDetails.name}/>
                    )}
                    <p>{chatDetails.name}</p>
                    <p>{members.length} учасники</p>
                    <div className={styles.buttonblock}>
                      <div onClick={() => setIsEditing(true)}><Pencil size={16}/></div>
                      <div onClick={handleLeave}><LogOut size={16}/></div>
                    </div>
                  </div>
                  <div className={styles.groupmembers}>
                    <div onClick={() => setIsAddingMembers(true)}>Додати в групу
                      <UserRoundPlus
                        className={styles.addusericon}
                        size={16}/>
                    </div>
                    <div className={styles.innerDivider}></div>
                    <div className={styles.memberslist}>
                      {members.map(member => (
                        <div
                          className={styles.memberscard}
                          key={member.id}
                          onContextMenu={(e) => handleRightClick(e, member.id)}
                        >
                          {member.avatar_url === null ? (
                            <Avvvatars value={member.name}/>
                          ) : (
                            <img
                              alt={member.username}
                              src={`${API_URL}${member.avatar_url}`}/>
                          )}
                          <div><p className={styles.username}>{member.username}</p>
                            <span className={styles.userstatus}><UserStatus
                              isOnline={member?.is_online}
                              lastSeen={member?.last_seen}/>
                        </span></div>
                          <p className={member.role === "admin" ? styles.userAdmin : styles.userMember}>{member.role}</p>
                        </div>
                      ))}</div>
                  </div>
                </>
              )}
            </>
          )}
          <X
            className={styles.closebtn}
            size={24}
            onClick={onClose}/>
          {contextMenu.visible && (
            <>
              <ContextWindow
                id={contextMenu.id}
                x={contextMenu.x}
                y={contextMenu.y}
                containerWidth={contextMenu.containerWidth}
                containerHeight={contextMenu.containerHeight}
                type={contextMenu.type}
                chatId={contextMenu.chatId}
                targetId={contextMenu.targetId}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default GroupDetails;