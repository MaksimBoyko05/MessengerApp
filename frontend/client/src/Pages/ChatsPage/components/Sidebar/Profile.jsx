import {useState, useEffect} from "react";
import axios from "axios";
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Settings} from 'lucide-react';
import {userService} from "@/api/userService.js";
import SettingsModal from "@/Pages/ChatsPage/components/SettingsWindow/SettingsModal.jsx";

function Profile() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [userimg, setUserimg] = useState("");
  const [open, setIsOpen] = useState(false);

  const API_URL = "http://localhost:5000";

  const handleClose = () => {
    setIsOpen(false)
    console.log("clicked")
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await userService.getUserData();
        setUsername(data.username);
        setUserimg(data.avatar_url);
        setUserId(data.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);


  return (
    <>
      <div className={styles.profileblock}>
        <img
          className={styles.avatarImg}
          src={`${API_URL}${userimg}`}
          alt="avatar"/>
        <div className={styles.profiletitles}>
          <p className={styles.usertitle}>{username}</p>
          <p className={styles.userstatus}>online</p>
        </div>
        <div className={styles.icons}>
          <Settings
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>
      {open && (
        <SettingsModal onClose={handleClose}/>
      )}
    </>
  );
}

export default Profile;
