import styles from "./Settings.module.scss"
import {useContext} from "react";
import {userService} from "@/api/userService.js";
import UserContext from "@/context/UserContext.jsx";
import {toast} from "react-toastify";

function PrivacySwitcher() {
  const {user, setUser} = useContext(UserContext);
  const activePrivacy = user?.is_private || false
  const handlePrivacyClick = async (leng, isPrivate) => {
    setUser(prev => ({...prev, is_private: isPrivate}));
    try {
      await userService.setIsPrivate(isPrivate)
      toast.success('Приватність змінено!');
    } catch (err) {
      console.error("Error with changing privacy", err)
    }
  };
  return (
    <>
      <div className={styles.languageblock}>
        <h4 className={styles.title}>Приватність акаунту</h4>
        <div className={styles.languagecontainer}>
          <div
            onClick={() => handlePrivacyClick('ua', true)}
            className={`${styles.lenguageButton} ${activePrivacy === true ? styles.active : ''}`}>Приватний
          </div>
          <div
            onClick={() => handlePrivacyClick('en', false)}
            className={`${styles.lenguageButton} ${activePrivacy === false ? styles.active : ''}`}>Відкритий
          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacySwitcher;