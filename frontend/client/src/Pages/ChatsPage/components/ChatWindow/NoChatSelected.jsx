import {useState} from "react";
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {MessageSquare} from "lucide-react";
import CreateChatButton from "@/Pages/ChatsPage/components/CreateChat/CreateChatButton.jsx";
import NewChatModal from "@/Pages/ChatsPage/components/CreateChat/NewChatModal.jsx";

const NoChatSelected = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.noChatWrapper}>
      <div className={styles.content}>
        <MessageSquare
          size={50}
          color="#2B7FFF"/>
        <h3>Оберіть чат</h3>
        <p>Виберіть співрозмовника зі списку зліва, щоб почати спілкування.</p>
      </div>
      {/*<CreateChatButton setIsOpen={setIsOpen}/>*/}
      {/*{isOpen && (*/}
      {/*  <NewChatModal setIsOpen={setIsOpen}/>*/}
      {/*)}*/}
    </div>
  );
};

export default NoChatSelected;