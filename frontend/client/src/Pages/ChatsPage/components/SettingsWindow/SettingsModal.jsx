import ThemeSwitcher from "@/Pages/ChatsPage/components/SettingsWindow/ThemeSwitcher.jsx";
import styles from "./Settings.module.scss"
import {X} from "lucide-react";
import LanguageSwitcher from "@/Pages/ChatsPage/components/SettingsWindow/LanguageSwitcher.jsx";
import {useEffect, useState} from "react";
import {userService} from "@/api/userService.js";
import ProfileSettings from "@/Pages/ChatsPage/components/SettingsWindow/ProfileSettings.jsx";

function SettingsModal({onClose}) {
  const [userData, setUserData] = useState({})
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userService.getUserData()
        setUserData(res);
        console.log(res);
      } catch (err) {
        console.error("Error fetching user", err)
      }
    }
    fetchUserData();
  }, []);
  return (
    <>
      <div className={styles.modalwrapper}>
        <div className={styles.modalcontainer}>
          <X
            className={styles.closebtn}
            size={24}
            onClick={onClose}/>
          <h2>Settings</h2>
          <ProfileSettings user={userData}/>
          <LanguageSwitcher/>
          <ThemeSwitcher/>
        </div>
      </div>
    </>
  )
}

export default SettingsModal;