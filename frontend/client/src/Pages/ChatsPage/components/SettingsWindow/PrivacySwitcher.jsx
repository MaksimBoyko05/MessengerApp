import styles from "./Settings.module.scss"
import {useState} from "react";
import {userService} from "@/api/userService.js";

function PrivacySwitcher() {
  const [activeLanguage, setActiveLanguage] = useState()

  const handlePrivacyClick = async (leng, isPrivate) => {
    setActiveLanguage(leng);
    try {
      await userService.setIsPrivate(isPrivate)
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
            className={`${styles.lenguageButton} ${activeLanguage === 'ua' ? styles.active : ''}`}>Приватний
          </div>
          <div
            onClick={() => handlePrivacyClick('en', false)}
            className={`${styles.lenguageButton} ${activeLanguage === 'en' ? styles.active : ''}`}>Відкритий
          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacySwitcher;