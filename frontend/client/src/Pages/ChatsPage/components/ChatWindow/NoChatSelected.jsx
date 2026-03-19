import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {MessageSquare} from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className={styles.noChatWrapper}>
      <div className={styles.content}>
        <MessageSquare
          size={50}
          color="#2B7FFF"/>
        <h3>Оберіть чат</h3>
        <p>Виберіть співрозмовника зі списку зліва, щоб почати спілкування.</p>
      </div>
    </div>
  );
};

export default NoChatSelected;