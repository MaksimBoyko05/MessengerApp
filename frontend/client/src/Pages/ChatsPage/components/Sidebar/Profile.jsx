import {useState, useEffect, useContext} from "react";
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Settings} from 'lucide-react';
import {LogOut} from 'lucide-react';
import {userService} from "@/api/userService.js";
import SettingsModal from "@/Pages/ChatsPage/components/SettingsWindow/SettingsModal.jsx";
import {UserContext} from "@/context/UserContext.jsx"
import {useNavigate} from "react-router";

function Profile() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [userimg, setUserimg] = useState("");
  const [open, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const API_URL = "http://localhost:5000";
  const {setUser} = useContext(UserContext);

  const handleClose = () => {
    setIsOpen(false)
    console.log("clicked")
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null)
    navigate("/authorization");
  }
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
        <div className={styles.logout}>
          <LogOut
            size={16}
            onClick={() => handleLogout()}/>
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
