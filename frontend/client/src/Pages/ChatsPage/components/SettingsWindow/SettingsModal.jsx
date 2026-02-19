import ThemeSwitcher from "@/Pages/ChatsPage/components/SettingsWindow/ThemeSwitcher.jsx";
import styles from "./Settings.module.scss"
import {X} from "lucide-react";
import LanguageSwitcher from "@/Pages/ChatsPage/components/SettingsWindow/LanguageSwitcher.jsx";

function SettingsModal({onClose}) {
  return (
    <>
      <div className={styles.modalwrapper}>
        <div className={styles.modalcontainer}>
          <X
            size={24}
            onClick={onClose}/>
          <h2>Settings</h2>
          <LanguageSwitcher/>
          <ThemeSwitcher/>
        </div>
      </div>
    </>
  )
}

export default SettingsModal;