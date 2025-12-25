import {useEffect, useState} from "react";
import {chatsService} from '../../../api/chatsService.js';
import styles from "../Chats.module.scss"
import ChatMessages from "./ChatMessages";
import SendMessageComponent from "./SendMessageComponent.jsx";
import {useSocket} from "../../../context/SocketContext.jsx"

function ChatWindow({chatId}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const {socket} = useSocket();

  useEffect(() => {
    if (!chatId || isNaN(chatId)) return;
    const fetchChatMessages = async () => {
      setLoading(true);
      setMessages([]);
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

  useEffect(() => {
    if (!socket || !chatId) return;
    const roomName = chatId.toString();
    socket.emit('join_chat', roomName);

    const handleReceiveMessage = (newMessage) => {
      console.log("Нове повідомлення отримано:", newMessage);

      if (Number(newMessage.chat_id) === Number(chatId)) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit('leave_chat', roomName);
    };
  }, [socket, chatId]);

  if (loading) return <div>Завантаження...</div>;

  return (
    <>
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
        <SendMessageComponent chatId={chatId}/>
      </div>
    </>
  )
}

export default ChatWindow;