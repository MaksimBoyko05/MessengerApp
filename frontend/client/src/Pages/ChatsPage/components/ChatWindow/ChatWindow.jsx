import {useContext, useEffect, useState, useRef} from "react";
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import ChatMessages from "./ChatMessages.jsx";
import SendMessageComponent from "./SendMessageComponent.jsx";
import {useSocket} from "@/context/SocketContext.jsx";
import ChatHeader from "./ChatHeader.jsx";
import NoChatSelected from "./NoChatSelected.jsx";
import AIGenerateSuggestions from "@/Pages/ChatsPage/components/ChatWindow/AIComponents/AIGenerateSuggestions.jsx";
import UserContext from "@/context/UserContext.jsx";
import {ChatContext} from "@/context/ChatContext.jsx";
import {ChatProvider} from "@/context/ChatContext.jsx";
import ContextWindow from "@/Pages/ChatsPage/components/Sidebar/ContextWindow.jsx";

function ChatWindow({chatId}) {
  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [contextMenu, setContextMenu] = useState({
    id: null,
    x: null,
    y: null,
    visible: false,
    type: "",
    chatId: null,
    targetId: null,
  })


  const {socket} = useSocket();
  const {user} = useContext(UserContext);

  const messagesEndRef = useRef();
  const messagesContainerRef = useRef();
  const lastMessageIdRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    lastMessageIdRef.current = null;
  }, [chatId]);

  useEffect(() => {
    if (!chatId || isNaN(chatId)) return;

    const fetchChatData = async () => {
      setLoading(true);
      setMessages([]);
      setCompanion(null);

      try {
        const data = await chatsService.getMessages(chatId);
        const fetchedMessages = data.messages || [];
        setHasMore(fetchedMessages.length >= 30);
        setMessages(data.messages || []);
        setCompanion(data.chatDetails.companion || null);
        setChatDetails(data.chatDetails)
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
    const handleMessageDeleted = ({messageId, chatId: deletedChatId}) => {
      if (Number(deletedChatId) === Number(chatId)) {
        setMessages((prev) => prev.map((msg) => msg.id === messageId ? {...msg, is_deleted: true} : msg))
      }
    }
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
      setChatDetails(prevDetails => {
        if (!prevDetails.members) return prevDetails
        return {
          ...prevDetails,
          members: prevDetails.members.map(member => {
            if (member.id === statusData.userId) {
              return {
                ...member,
                is_online: statusData.online,
                last_seen: statusData.lastSeen
              };
            }
            return member;
          })
        }
      })
    }

    const handleGroupUpdate = async (payload) => {
      console.log("Catched group update", payload);

      setChatDetails(prevDetails => {
        if (!prevDetails || prevDetails.id !== payload.chatId) {
          return prevDetails
        }
        switch (payload.action) {
          case "update_name" :
            return {
              ...prevDetails, name: payload.newName
            }
          case "update_avatar":
            return {
              ...prevDetails, avatar_url: payload.newAvatarUrl
            }
          case "remove_member" :
            return {
              ...prevDetails,
              members: prevDetails.members.filter((member => member.id !== payload.userId))
            }
          case "promote_admin":
            return {
              ...prevDetails,
              members: prevDetails.members.map(member => {
                if (member.id === payload.userId) {
                  return {
                    ...member,
                    role: "admin"
                  };
                }
                return member;
              })
            }
          case "promote_member":
            return {
              ...prevDetails,
              members: prevDetails.members.map(member => {
                if (member.id === payload.userId) {
                  return {
                    ...member,
                    role: "member"
                  };
                }
                return member;
              })
            }
          default:
            return prevDetails;
        }
      });
      if (payload.action === "add_members") {
        try {
          const data = await chatsService.getMessages(chatId);
          setChatDetails(data.chatDetails)
        } catch (err) {
          console.log("Error with updating details after add_members", err)
        }
      }
    }


    socket.on("message_read", handleMessageRead)
    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_status_change", handleStatusChange);
    socket.on("group_updated", handleGroupUpdate);
    socket.on("message_deleted", handleMessageDeleted);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("user_status_change", handleStatusChange);
      socket.off("group_updated", handleGroupUpdate);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [socket, chatId, user]);

  useEffect(() => {
    if (loading) return;

    const currentLastMessageId = messages?.at(-1)?.id;

    if (currentLastMessageId && currentLastMessageId !== lastMessageIdRef.current) {
      const scrollBehavior = lastMessageIdRef.current === null ? "auto" : "smooth";

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: scrollBehavior,
          block: "end"
        });
      }, 50);
    }

    lastMessageIdRef.current = currentLastMessageId;
  }, [messages, loading]);

  const loadMoreMessages = async (cursor) => {
    setIsLoadingMore(true);
    const previousScrollHeight = messagesContainerRef.current.scrollHeight;
    try {
      const data = await chatsService.getMessages(chatId, cursor)
      const newlyFetchedMessages = data.messages || [];
      if (newlyFetchedMessages.length < 30) {
        setHasMore(false)
      }
      setMessages(prev => [...newlyFetchedMessages, ...prev]);

      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
        }
      }, 0);

    } catch (err) {
      console.error("Error fetching history", err)
    } finally {
      setIsLoadingMore(false);
    }
  }
  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop < 50 && !isLoadingMore && hasMore) {
      const cursor = messages[0]?.created_at;
      if (cursor) {
        loadMoreMessages(cursor)
      }
    }
  }

  const handleRightClick = (e, id) => {
    e.preventDefault()

    if (!chatWindowRef.current) return;
    const rect = chatWindowRef.current.getBoundingClientRect();

    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    setContextMenu({
      ...contextMenu,
      id: id,
      x: relativeX,
      y: relativeY,
      containerWidth: rect.width,
      containerHeight: rect.height,
      visible: true,
      type: "message",
      chatId: chatDetails.id,
      targetId: id,

    })
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({
        id: null,
        x: null,
        y: null,
        visible: false,
        type: "",
        chatId: null,
        targetId: null,
      });
    };
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const closeContextMenu = () => {
    setContextMenu(prev => ({...prev, visible: false}));
  };
  if (!chatId) {
    return <NoChatSelected/>;
  }
  if (loading) return <div className={styles.loading}>Завантаження...</div>;


  return (
    <div
      className={styles.chatwindow}
      ref={chatWindowRef}>
      <ChatContext.Provider value={{chatDetails, setChatDetails}}>
        <ChatHeader
          chatDetails={chatDetails}
          companion={companion}/>
      </ChatContext.Provider>
      <div
        onScroll={handleScroll}
        ref={messagesContainerRef}
        className={styles.messagesArea}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={styles.messageRow}>
              <ChatMessages
                onContextMenu={(e) => handleRightClick(e, msg.id)}
                key={msg.id}
                isGroup={chatDetails.is_group}
                msg={msg}/>
              {index === messages.length - 1 && (
                <AIGenerateSuggestions
                  msg={msg}
                  suggestions={suggestions}
                  onSetSuggestions={setSuggestions}/>
              )}
            </div>
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
        receiverId={companion?.id}
        suggestions={suggestions}
        onSetSuggestions={setSuggestions}
      />
      {contextMenu.visible && (
        <>
          <ContextWindow
            id={contextMenu.id}
            x={contextMenu.x}
            y={contextMenu.y}
            containerWidth={contextMenu.containerWidth}
            containerHeight={contextMenu.containerHeight}
            type={contextMenu.type}
            chatId={contextMenu.chatId}
            targetId={contextMenu.targetId}
            closeMenu={closeContextMenu}
          />
        </>
      )}
    </div>
  );
}

export default ChatWindow;