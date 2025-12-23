import {useEffect, useState} from 'react';
import {chatsService} from '../../../api/chatsService.js';
import styles from "../Chats.module.scss"
import ChatBlock from "./ChatBlock.jsx"

function ChatsList({onSelectedChat}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await chatsService.getAll();
        setChats(data);
        console.log(data);
      } catch (error) {
        console.error("Помилка при завантаженні чатів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    onSelectedChat(chatId);
  }

  if (loading) return <div>Завантаження...</div>;
  if (!loading && chats.length === 0) {
    return <div> У вас ще немає активних чатів</div>;
  }
  return (

    <div className={styles.chatsList}>
      {chats.map(chat => (
        <ChatBlock
          key={chat.id}
          chat={chat}
          onClick={handleChatClick}
        />
      ))}
    </div>)
}

export default ChatsList;