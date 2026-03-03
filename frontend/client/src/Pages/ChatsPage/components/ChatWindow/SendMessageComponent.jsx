import {useState, useEffect} from "react";
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Send} from 'lucide-react';
import AISuggestions from "@/Pages/ChatsPage/components/ChatWindow/AIComponents/AISuggestions.jsx";

function SendMessageComponent({chatId, receiverId, suggestions, onSetSuggestions}) {
  const [messageData, setMessageData] = useState({
    text: "",
  });
  const handleChange = (e) => {
    const {name, value} = e.target;
    setMessageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSuggestionClick = (text) => {
    setMessageData((prev) => ({
      ...prev,
      text: text,
    }));
    onSetSuggestions([]);
  }
  const handleSendMessage = async () => {
    if (!messageData.text.trim()) return;
    const payload = {
      chatId,
      receiverId: receiverId,
      text: messageData.text,
    }
    console.log(payload)
    try {
      const data = await chatsService.sendMessage(payload);
      setMessageData({
        ...messageData,
        text: "",
      })
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <>
      <AISuggestions
        suggestions={suggestions}
        onSelect={handleSuggestionClick}/>
      <div className={styles.sendcomponent}>
        <input
          name="text"
          placeholder="Type a message..."
          value={messageData.text}
          onChange={handleChange}
          className={styles.textfield}
        />
        <button
          onClick={handleSendMessage}
          className={styles.sendbtn}>
          <Send/>
        </button>
      </div>
    </>
  )
}

export default SendMessageComponent;