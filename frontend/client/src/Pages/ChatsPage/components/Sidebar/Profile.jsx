import {useState, useEffect} from "react";
import axios from "axios";
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Settings} from 'lucide-react';
import {userService} from "@/api/userService.js";

function Profile() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [userimg, setUserimg] = useState("");

  const API_URL = "http://localhost:5000";

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
        <Settings/>
      </div>
    </div>
  );
}

export default Profile;
