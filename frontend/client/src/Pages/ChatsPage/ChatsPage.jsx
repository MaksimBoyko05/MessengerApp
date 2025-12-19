import { useEffect, useState } from "react";
import axios from "axios";
import ChatsList from "./components/ChatsList";
import styles from"./Chats.module.scss";
import Profile from "./components/Profile.jsx";
function ChatsPage() {
  

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebarwrapper}>
        <div className={styles.profile}>
          <Profile/>
        </div>
        <div>
        <ChatsList />
        </div>
      </div>
    </div>
  );
}
export default ChatsPage;
