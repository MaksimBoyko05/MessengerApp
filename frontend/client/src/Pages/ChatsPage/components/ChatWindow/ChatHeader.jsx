import styles from "@/Pages/ChatsPage/Chats.module.scss";
import UserStatus from "./UserStatus.jsx"
import Avvvatars from "avvvatars-react";
import {useState} from "react";
import GroupDetails from "@/Pages/ChatsPage/components/GroupFeatures/GroupDetails.jsx";
import {ChevronLeft} from "lucide-react";

function ChatHeader({chatDetails, companion, onBack}) {
  const API_URL = "http://localhost:5000";
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div
        onClick={() => chatDetails.is_group ? setIsOpen(true) : null}
        className={styles.chatheaderwrapper}
      >
        <ChevronLeft onClick={onBack}/>
        {chatDetails.is_group ? (
          <>
            <div className={styles.groupimage}>
              {chatDetails.avatar_url ? (
                <img
                  alt={"groupimg"}
                  src={`${API_URL}${chatDetails.avatar_url}`}/>
              ) : (
                <Avvvatars
                  size={42}
                  value={chatDetails.name}/>
              )}
            </div>
            <div className={styles.headertext}>
              <p>{chatDetails.name}</p>
              <p className={styles.groupmembers}>Учасники: {chatDetails.members.length}, {chatDetails.members?.filter(members => members.is_online).length} в
                мережі</p>
            </div>
          </>
        ) : (
          <>
            {chatDetails.companion?.avatar_url ? (
              <img
                alt={"profile_img"}
                src={`${API_URL}${companion?.avatar_url}`}/>) : (
              <Avvvatars
                size={42}
                value={chatDetails.companion?.username}/>
            )}
            <div className={styles.headertext}>
              <p>{companion?.username}</p>
              <UserStatus
                isOnline={companion?.is_online}
                lastSeen={companion?.last_seen}/>
            </div>
          </>
        )}
        {isOpen && (
          <GroupDetails
            onCloseChat={onBack}
            setIsOpen={setIsOpen}
            details={chatDetails}/>
        )}
      </div>
    </>
  )
}

export default ChatHeader;