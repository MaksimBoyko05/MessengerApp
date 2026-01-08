import {useState, useEffect} from "react";
import axios from "axios";
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Settings} from 'lucide-react';

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
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {Authorization: `Bearer ${token}`}
        });
        setUsername(res.data.username);
        setUserimg(res.data.avatar_url);
        setUserId(res.data.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token && userId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUsername(res.data.username);
          setUserimg(res.data.avatar_url);
          console.log(userimg)
        } catch (err) {
          console.error("Помилка отримання даних користувача", err);
          localStorage.removeItem("token");
        }
      }
    };
    fetchUserData();
  }, [userId]);

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
