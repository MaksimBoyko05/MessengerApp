import {useEffect, useState} from "react";
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import ChatMessages from "./ChatMessages.jsx";
import SendMessageComponent from "./SendMessageComponent.jsx";
import {useSocket} from "@/context/SocketContext.jsx";
import ChatHeader from "./ChatHeader.jsx";
import NoChatSelected from "./NoChatSelected.jsx";

function ChatWindow({chatId}) {
  const [messages, setMessages] = useState([]);
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(false);
  const {socket} = useSocket();

  useEffect(() => {
    if (!chatId || isNaN(chatId)) return;

    const fetchChatData = async () => {
      setLoading(true);
      setMessages([]);
      setCompanion(null);

      try {
        const data = await chatsService.getMessages(chatId);
        setMessages(data.messages || []);
        setCompanion(data.companion || null);

        console.log("Дані чату:", data);
      } catch (error) {
        console.error("Помилка при завантаженні даних чату:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;
    const roomName = chatId.toString();
    socket.emit('join_chat', roomName);

    const handleReceiveMessage = (newMessage) => {
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
  if (!chatId) {
    return <NoChatSelected/>;
  }
  if (loading) return <div className={styles.loading}>Завантаження...</div>;

  return (
    <div className={styles.chatwindow}>
      <ChatHeader companion={companion}/>
      <div className={styles.messagesArea}>
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

      <SendMessageComponent
        chatId={chatId}
        receiverId={companion?.id}/>
    </div>
  );
}

export default ChatWindow;