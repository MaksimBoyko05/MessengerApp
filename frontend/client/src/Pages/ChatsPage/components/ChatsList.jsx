import { useEffect, useState } from 'react';
import { chatsService } from '../../../api/chatsService.js';
function ChatsList(){
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Завантаження...</div>;
  if (!loading && chats.length === 0) {
    return <div> У вас ще немає активних чатів</div>;
  }
  return (

    <div>
      {chats.map(chat => (
        <div key={chat.id} >
          {chat.name}
          {chat.last_message}
        </div>
      ))}
    </div>
  )
}
export default ChatsList;