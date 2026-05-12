import {useContext, useEffect, useRef, useState} from 'react';
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import ChatBlock from "./ChatBlock.jsx";
import CreateChatButton from "@/Pages/ChatsPage/components/CreateChat/CreateChatButton.jsx";
import NewChatModal from "@/Pages/ChatsPage/components/CreateChat/NewChatModal.jsx";
import {useSocket} from "@/context/SocketContext.jsx";
import UserContext from "@/context/UserContext.jsx";
import ContextWindow from "@/Pages/ChatsPage/components/Sidebar/ContextWindow.jsx";

function ChatsList({onSelectedChat, selectedChatId, onFilterType, onSearchQuery}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const chatsRef = useRef(chats);
  const selectedChatIdRef = useRef(selectedChatId);
  const {socket} = useSocket();
  const {user} = useContext(UserContext);
  const [contextMenu, setContextMenu] = useState({
    id: null,
    x: null,
    y: null,
    visible: false,
    type: "",
  })
  const filteredChats = (() => {
    let baseChats = [];
    switch (onFilterType) {
      case 'all':
        baseChats = chats;
        break;
      case 'unread' :
        baseChats = chats.filter(chatsList => !chatsList.is_last_message_read && chatsList.last_message_author_id !== user.id);
        break;
      case 'group' :
        baseChats = chats.filter(chatsList => chatsList.is_group);
        break;
      default:
        baseChats = chats;
    }
    return baseChats.filter(chat => chat.name.toLowerCase().includes(onSearchQuery?.toLowerCase()));
  })();


  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({
        id: null,
        x: null,
        y: null,
        visible: false,
        type: "",
      });
    };
    const handleForceOpenChat = (e) => {
      const newChatData = e.detail;
      handleChatCreated(newChatData);
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('forceOpenChat', handleForceOpenChat);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('forceOpenChat', handleForceOpenChat);
    };
  }, []);

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
  }, [user, onFilterType]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (rawMessage) => {

      const message = {
        ...rawMessage,
        chat_id: Number(rawMessage.chat_id || rawMessage.chatId),
        user_id: Number(rawMessage.user_id || rawMessage.senderId),
      };

      const currentChats = chatsRef.current;
      const existingChat = currentChats.find((c) => Number(c.id) === message.chat_id);

      if (existingChat) {
        setChats((prevChats) => {
          const chatToUpdate = prevChats.find((c) => Number(c.id) === message.chat_id);
          if (!chatToUpdate) return prevChats;

          const isChatOpen = Number(selectedChatIdRef.current) === message.chat_id;

          const updatedChat = {
            ...chatToUpdate,
            last_message: message.text || message.message,
            last_message_time: message.created_at || new Date().toISOString(),
            last_message_author_id: message.user_id,
            is_last_message_read: false,
            unread_count: isChatOpen
              ? 0
              : (Number(chatToUpdate.unread_count) || 0) + 1,
          };

          const otherChats = prevChats.filter((c) => Number(c.id) !== message.chat_id);
          return [updatedChat, ...otherChats];
        });
      } else {
        console.log("Чат не знайдено, fetching ID: ", message.chat_id);
        fetchMissingChat(message.chat_id);
      }
    };
    const handleNewChat = (newChatData) => {
      console.log("SOCKET ОТРИМАВ НОВИЙ ЧАТ:", newChatData);
      setChats((prevChats) => {
        if (prevChats.some(c => c.id === newChatData.id)) {
          return prevChats;
        }
        return [newChatData, ...prevChats];
      });

      socket.emit("join_chat", newChatData.id);
    };
    const handleStatusChange = (statusData) => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.partner_id === statusData.userId) {
            return {
              ...chat,
              is_online: statusData.online,
              last_seen: statusData.lastSeen
            };
          }
          return chat;
        })
      })
    }
    const handleMessageRead = ({chat_id}) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === Number(chat_id)
            ? {...chat, is_last_message_read: true}
            : chat
        )
      );
    };
    const handleGroupUpdate = async (payload) => {
      console.log("Catched group update in Sidebar", payload);

      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id !== payload.chatId) {
            return chat;
          }
          switch (payload.action) {
            case "update_name":
              return {...chat, name: payload.newName};
            case "update_avatar":
              return {...chat, avatar_url: payload.newAvatarUrl};
            case "remove_member":
              return chat;
            default:
              return chat;
          }
        });
      });
    };
    const handleChatDeleted = ({chatId}) => {
      setChats((prevChats) => prevChats.filter(chat => Number(chat.id) !== Number(chatId)));

      if (Number(selectedChatIdRef.current) === Number(chatId)) {
        window.dispatchEvent(new CustomEvent('chatDeletedByPartner', {
          detail: {chatId}
        }));
      }
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("new_chat_created", handleNewChat);
    socket.on("message_read", handleMessageRead);
    socket.on("user_status_change", handleStatusChange);
    socket.on("group_updated", handleGroupUpdate);
    socket.on("chat_deleted", handleChatDeleted);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("new_chat_created", handleNewChat);
      socket.off("message_read", handleMessageRead);
      socket.off("user_status_change", handleStatusChange);
      socket.off("group_updated", handleGroupUpdate);
      socket.off("chat_deleted", handleChatDeleted);
    };
  }, [socket]);
  const fetchMissingChat = async (chatId) => {
    try {
      console.log("Fetch дані для чату", chatId);
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
  const handleDeleteChat = async (forEveryone) => {
    const id = contextMenu.id
    try {
      await chatsService.deleteChat(id, forEveryone);
      setChats(prevChats => prevChats.filter(chat => chat.id !== id))
      onSelectedChat(0);
    } catch (err) {
      console.log(err)
    } finally {
      setContextMenu({
        id: null,
        x: null,
        y: null,
        visible: false,
        type: "",
      })
    }
  }
  const handleRightClick = (e, id) => {
    e.preventDefault()
    setContextMenu({
      ...contextMenu,
      id: id,
      x: e.clientX,
      y: e.clientY,
      visible: true,
      type: "chatList",
    })
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className={styles.chatsList}>
      {!loading && chats.length > 0 ? (
        filteredChats.map(chat => (
          <div
            key={chat.id}
            onContextMenu={(e) => handleRightClick(e, chat.id)}>
            <ChatBlock
              chat={chat}
              onClick={handleChatClick}
              isActive={chat.id === selectedChatId}
            />
          </div>
        ))
      ) : (
        <div className={styles.chatsListNoMessages}>У вас ще немає активних чатів</div>
      )}
      {contextMenu.visible && (
        <>
          <ContextWindow
            id={contextMenu.id}
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type}
            handleDelete={handleDeleteChat}
          />
        </>
      )}
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