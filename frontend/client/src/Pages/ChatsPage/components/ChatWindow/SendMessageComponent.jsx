import {useState} from "react";
import {chatsService} from '@/api/chatsService.js';
import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Send} from 'lucide-react';
import {Sparkles} from 'lucide-react';
import AISuggestions from "@/Pages/ChatsPage/components/ChatWindow/AIComponents/AISuggestions.jsx";
import AskAI from "@/Pages/ChatsPage/components/ChatWindow/AIComponents/AskAI.jsx";

function SendMessageComponent({chatId, receiverId, suggestions, onSetSuggestions}) {
  const [messageData, setMessageData] = useState({
    text: "",
  });
  const [showPopup, setShowPopup] = useState(false);
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
        <textarea
          name="text"
          placeholder="Повідомлення..."
          value={messageData.text}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className={styles.textfield}
          rows={1}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <button
          onClick={handleSendMessage}
          className={styles.sendbtn}>
          <Send/>
        </button>
        <button
          className={styles.askAibtn}
          onClick={() => setShowPopup(true)}><Sparkles/></button>
        {showPopup && (
          <AskAI
            chatId={chatId}
            showPopup={setShowPopup}/>
        )}
      </div>
    </>
  )
}

export default SendMessageComponent;