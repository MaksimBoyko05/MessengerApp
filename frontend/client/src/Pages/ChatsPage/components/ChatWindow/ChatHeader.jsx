import styles from "@/Pages/ChatsPage/Chats.module.scss";
import UserStatus from "./UserStatus.jsx"
import Avvvatars from "avvvatars-react";
import {useState} from "react";
import GroupDetails from "@/Pages/ChatsPage/components/GroupFeatures/GroupDetails.jsx";

function ChatHeader({chatDetails, companion}) {
  const API_URL = "http://localhost:5000";
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={styles.chatheaderwrapper}>
        {chatDetails.is_group ? (
          <>
            <div className={styles.groupimage}><Avvvatars
              size={40}
              value={chatDetails.name}/></div>
            <div className={styles.headertext}>
              <p>{chatDetails.name}</p>
              <p className={styles.groupmembers}>Members: {chatDetails.members.length}, {chatDetails.members?.filter(members => members.is_online).length} online</p>
            </div>
          </>
        ) : (
          <>
            <img
              alt={"profile_img"}
              src={`${API_URL}${companion?.avatar_url}`}/>
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
            setIsOpen={setIsOpen}
            details={chatDetails}/>
        )}
      </div>
    </>
  )
}

export default ChatHeader;