import {useEffect, useState} from "react";
import {chatsService} from '../../../api/chatsService.js';
import styles from "../Chats.module.scss"
import ChatMessages from "./ChatMessages";

function ChatWindow({chatId}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!chatId || isNaN(chatId)) {
      return;
    }
    const fetchChatMessages = async () => {
      try {
        const data = await chatsService.getMessages(chatId);
        setMessages(data);
        console.log(data);
      } catch (error) {
        console.error("Помилка при завантаженні повідомлень:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, [chatId]);
  if (loading) return <div>Завантаження...</div>;
  if (!loading && messages.length === 0) {
    return <div> У вас ще немає повідомлень</div>;
  }
  return (<>
    <div className={styles.chatwindow}>
      {messages.length > 0 ? (
        messages.map((msg) => (
          <ChatMessages
            key={msg.id}
            msg={msg}/>
        ))
      ) : (
        <div className={styles.noMessages}>У вас ще немає повідомлень у цьому чаті</div>
      )}
    </div>
  </>)
}

export default ChatWindow;