import ThemeSwitcher from "@/Pages/ChatsPage/components/SettingsWindow/ThemeSwitcher.jsx";
import styles from "./Settings.module.scss";
import {X} from "lucide-react";
import PrivacySwitcher from "@/Pages/ChatsPage/components/SettingsWindow/PrivacySwitcher.jsx";
import {useEffect, useState} from "react";
import {userService} from "@/api/userService.js";
import ProfileSettings from "@/Pages/ChatsPage/components/SettingsWindow/ProfileSettings.jsx";
import SecuritySettings from "@/Pages/ChatsPage/components/SettingsWindow/SecuritySettings.jsx";

function SettingsModal({onClose}) {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userService.getUserData();
        setUserData(res);
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className={styles.modalwrapper}>
      <div className={styles.modalcontainer}>
        <div className={styles.modalheader}>
          <h2 className={styles.modaltitle}>Налаштування</h2>
          <X
            className={styles.closebtn}
            size={24}
            onClick={onClose}
          />
        </div>
        <div className={styles.modalcontent}>
          <ProfileSettings user={userData}/>
          <SecuritySettings user={userData}/>
          <PrivacySwitcher/>
          <ThemeSwitcher/>
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;