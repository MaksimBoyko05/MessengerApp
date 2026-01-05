import {useEffect, useState} from 'react';
import {chatsService} from '../../../api/chatsService.js';
import styles from "../Chats.module.scss"
import ChatBlock from "./ChatBlock.jsx"
import {useSocket} from "../../../context/SocketContext.jsx";

function ChatsList({onSelectedChat, selectedChatId}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const {socket} = useSocket();

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
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      console.log("Нове повідомлення отримано:", newMessage);
      console.log("--- НОВЕ ПОВІДОМЛЕННЯ ВІД СОКЕТА ---");
      console.log("Дані повідомлення:", newMessage);
      console.log("Тип chat_id:", typeof newMessage.chat_id);

      setChats((prevChats) => {
        const existingChat = prevChats.find((c) => c.id === newMessage.chat_id);

        if (existingChat) {
          const otherChats = prevChats.filter((c) => c.id !== newMessage.chat_id);
          console.log(newMessage)
          const updatedChat = {
            ...existingChat,
            last_message: newMessage.text,
            last_message_time: newMessage.created_at,
            unread_count: selectedChatId === newMessage.chat_id
              ? 0
              : (Number(existingChat.unread_count) || 0) + 1,
          };

          return [updatedChat, ...otherChats];
        } else {
          fetchNewChat(newMessage.chat_id);
          return prevChats;
        }
      });
    };

    const fetchNewChat = async (chatId) => {
      try {
        const newChatData = await chatsService.getChatDetails(chatId);
        setChats((prev) => {
          if (prev.some(c => c.id === newChatData.id)) return prev;
          return [newChatData, ...prev];
        });
      } catch (err) {
        console.error("Помилка завантаження чату:", err);
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, selectedChatId]);

  const handleChatClick = (chatId) => {
    onSelectedChat(chatId);
    setChats(prevChats => prevChats.map(chat =>
      (chat.id === chatId && chat.unread_count > 0)
        ? {...chat, unread_count: 0}
        : chat
    ));
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
          isActive={chat.id === selectedChatId}
        />
      ))}
    </div>)
}

export default ChatsList;