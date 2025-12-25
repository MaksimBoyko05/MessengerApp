import {useState, useEffect} from "react";
import {chatsService} from '../../../api/chatsService.js';

function SendMessageComponent({chatId}) {
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

  const handleSendMessage = async () => {
    if (!messageData.text.trim()) return;
    const payload = {
      receiverId: chatId,
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
      <input
        name="text"
        value={messageData.text}
        onChange={handleChange}
      />
      <button onClick={handleSendMessage}>Send</button>
    </>
  )
}

export default SendMessageComponent;