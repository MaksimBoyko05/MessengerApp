import styles from "./Settings.module.scss"
import {useState} from "react";

function LanguageSwitcher() {
  const [activeLanguage, setActiveLanguage] = useState()

  const handleLanguageClick = (leng) => {
    setActiveLanguage(leng);
  };
  return (
    <>
      <div className={styles.languageblock}>
        <h4 className={styles.title}>Language</h4>
        <div className={styles.languagecontainer}>
          <div
            onClick={() => handleLanguageClick('ua')}
            className={`${styles.lenguageButton} ${activeLanguage === 'ua' ? styles.active : ''}`}>Ukrainian
          </div>
          <div
            onClick={() => handleLanguageClick('en')}
            className={`${styles.lenguageButton} ${activeLanguage === 'en' ? styles.active : ''}`}>English
          </div>
        </div>
      </div>
    </>
  )
}

export default LanguageSwitcher;