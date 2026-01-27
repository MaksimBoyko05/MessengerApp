import {useContext, useEffect, useState, useRef} from "react";
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import ChatMessages from "./ChatMessages.jsx";
import SendMessageComponent from "./SendMessageComponent.jsx";
import {useSocket} from "@/context/SocketContext.jsx";
import ChatHeader from "./ChatHeader.jsx";
import NoChatSelected from "./NoChatSelected.jsx";
import UserContext from "@/context/UserContext.jsx";

function ChatWindow({chatId}) {
  const [messages, setMessages] = useState([]);
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(false);
  const {socket} = useSocket();
  const {user} = useContext(UserContext);

  const messagesEndRef = useRef();
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
        if (newMessage.user_id !== user?.id) {
          console.log("Читаю нове повідомлення в реальному часі...");
          socket.emit("mark_messages_read", {
            chatId: chatId,
            userId: user.id
          });
        }
      }
    };
    const handleMessageRead = ({chat_id, user_id}) => {
      if (Number(chat_id) === Number(chatId)) {
        setMessages(prev =>
          prev.map((msg) =>
            !msg.is_read
              ? {...msg, is_read: true}
              : msg
          )
        )
      }
    }
    const handleStatusChange = (statusData) => {
      setCompanion(prevCompanion => {
        if (!prevCompanion) return prevCompanion;
        if (prevCompanion.id === statusData.userId) {
          return {
            ...prevCompanion,
            is_online: statusData.online,
            last_seen: statusData.lastSeen
          };
        }
        return prevCompanion;
      })
    }

    socket.on("message_read", handleMessageRead)
    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_status_change", handleStatusChange);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("user_status_change", handleStatusChange);
    };
  }, [socket, chatId, user]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth", block: "end"})
  }, [messages]);

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
        <div
          className={styles.msganchor}
          ref={messagesEndRef}/>
      </div>

      <SendMessageComponent
        chatId={chatId}
        receiverId={companion?.id}/>
    </div>
  );
}

export default ChatWindow;