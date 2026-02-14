import {useState} from "react";
import ChatsList from "./components/Sidebar/ChatsList.jsx";
import styles from "./Chats.module.scss";
import Profile from "./components/Sidebar/Profile.jsx";
import SearchBlock from "./components/Sidebar/Search.jsx";
import Filter from "./components/Sidebar/Filter.jsx";
import ChatWindow from "./components/ChatWindow/ChatWindow.jsx";

function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [filterType, setFilterType] = useState('all');

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebarwrapper}>
        <div className={styles.profile}>
          <Profile/>
        </div>
        <div className={styles.searchcontainer}>
          <SearchBlock/>
        </div>
        <div className={styles.filtercontainer}>
          <Filter onSetFilterType={setFilterType}/>
        </div>
        <div className={styles.chatslistwrapper}>
          <ChatsList
            onFilterType={filterType}
            onSelectedChat={setSelectedChatId}
            selectedChatId={selectedChatId}/>
        </div>
      </div>
      <ChatWindow chatId={selectedChatId}/>
    </div>
  );
}

export default ChatsPage;
