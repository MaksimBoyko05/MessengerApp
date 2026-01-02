import {useState} from "react";
import ChatsList from "./components/ChatsList";
import styles from "./Chats.module.scss";
import Profile from "./components/Profile.jsx";
import ChatWindow from "./components/ChatWindow.jsx";

function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebarwrapper}>
        <div className={styles.profile}>
          <Profile/>
        </div>
        <div>
          <ChatsList
            onSelectedChat={setSelectedChatId}
            selectedChatId={selectedChatId}/>
        </div>
      </div>
      <ChatWindow chatId={selectedChatId}/>
    </div>
  );
}

export default ChatsPage;
