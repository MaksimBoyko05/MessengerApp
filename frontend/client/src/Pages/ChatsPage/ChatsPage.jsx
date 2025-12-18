import { useEffect, useState } from "react";
import axios from "axios";
import styles from"./Chats.module.scss";
import Profile from "./Components/Profile.jsx";
function ChatsPage() {
  

  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
            <Profile/>
      </div>
    </div>
  );
}
export default ChatsPage;
