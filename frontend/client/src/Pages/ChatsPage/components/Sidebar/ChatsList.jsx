import {useContext, useEffect, useRef, useState} from 'react';
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import ChatBlock from "./ChatBlock.jsx";
import CreateChatButton from "@/Pages/ChatsPage/components/CreateChat/CreateChatButton.jsx";
import NewChatModal from "@/Pages/ChatsPage/components/CreateChat/NewChatModal.jsx";
import {useSocket} from "@/context/SocketContext.jsx";
import UserContext from "@/context/UserContext.jsx";

function ChatsList({onSelectedChat, selectedChatId}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const selectedChatIdRef = useRef(selectedChatId);

  const {socket} = useSocket();
  const {user} = useContext(UserContext);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await chatsService.getAll();
        setChats(data);
      } catch (error) {
        console.error("Помилка при завантаженні чатів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (rawMessage) => {
      const message = {
        ...rawMessage,
        chat_id: Number(rawMessage.chat_id || rawMessage.chatId),
        user_id: Number(rawMessage.user_id || rawMessage.senderId),
      };

      setChats((prevChats) => {
        const existingChat = prevChats.find((c) => Number(c.id) === message.chat_id);

        if (existingChat) {
          const isChatOpen = Number(selectedChatIdRef.current) === message.chat_id;

          const updatedChat = {
            ...existingChat,
            last_message: message.text || message.message,
            last_message_time: message.created_at || new Date().toISOString(),
            last_message_author_id: message.user_id,
            is_last_message_read: false,
            unread_count: isChatOpen
              ? 0
              : (Number(existingChat.unread_count) || 0) + 1,
          };

          const otherChats = prevChats.filter((c) => Number(c.id) !== message.chat_id);
          return [updatedChat, ...otherChats];
        }

        fetchMissingChat(message.chat_id);
        return prevChats;
      });
    };

    const handleMessageRead = ({chat_id}) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === Number(chat_id)
            ? {...chat, is_last_message_read: true}
            : chat
        )
      );
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket]);
  const fetchMissingChat = async (chatId) => {
    try {
      const newChatData = await chatsService.getChatDetails(chatId);
      setChats((prev) => {
        if (prev.some(c => c.id === newChatData.id)) return prev;
        return [newChatData, ...prev];
      });
    } catch (err) {
      console.error(`Не вдалося завантажити деталі чату ${chatId}:`, err);
    }
  };

  const handleChatClick = (chatId) => {
    if (socket && user) {
      socket.emit("mark_messages_read", {
        chatId: chatId,
        userId: user.id
      });
    }

    onSelectedChat(chatId);

    setChats(prevChats => prevChats.map(chat =>
      (chat.id === chatId && chat.unread_count > 0)
        ? {...chat, unread_count: 0}
        : chat
    ));
  };
  const handleChatCreated = (newChat) => {
    setChats(prevChats => {
      const exists = prevChats.find(c => c.id === newChat.id);
      if (exists) return prevChats;

      return [newChat, ...prevChats];
    });
    onSelectedChat(newChat.id);
  }

  if (loading) return <div>Завантаження...</div>;
  if (!loading && chats.length === 0) {
    return <div>У вас ще немає активних чатів</div>;
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
      <CreateChatButton setIsOpen={setIsOpen}/>
      {isOpen && (
        <NewChatModal
          setIsOpen={setIsOpen}
          onChatCreated={handleChatCreated}/>
      )}
    </div>
  );
}

export default ChatsList;