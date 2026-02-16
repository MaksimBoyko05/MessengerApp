import {useState, useEffect, useContext} from "react";
import {chatsService} from "@/api/chatsService.js";
import {Sparkles} from 'lucide-react';
import {UserContext} from "@/context/UserContext.jsx";
import styles from "./AISuggestions.module.scss"

function AIGenerateSuggestions({msg, suggestions, onSetSuggestions}) {
  const [isLoading, setIsLoading] = useState(false)
  const {user} = useContext(UserContext);

  const handleAiClick = async () => {
    if (suggestions.length > 0) {
      onSetSuggestions([]);
    }
    setIsLoading(true);
    try {
      const results = await chatsService.generateSmartReply(msg.chat_id, msg.id)
      onSetSuggestions(results)
    } catch (err) {
      console.log("AI err", err)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      {msg.user_id !== user.id && (
        <button
          className={styles.sparkbutton}
          onClick={handleAiClick}
          disabled={isLoading}>
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isLoading ? styles.animatespin : styles.aiIconColor}
          >
            {/* Головна велика зірка */}
            <path
              d="M12 3C12 3 13 9 19 12C13 15 12 21 12 21C12 21 11 15 5 12C11 9 12 3 12 3Z"
              fill="currentColor"
            />
            {/* Мала зірка зверху справа */}
            <path
              d="M19 4C19 4 19.4 6 21 7C19.4 8 19 10 19 10C19 10 18.6 8 17 7C18.6 6 19 4 19 4Z"
              fill="currentColor"
            />
            {/* Мала зірка знизу зліва */}
            <path
              d="M5 16C5 16 5.4 18 7 19C5.4 20 5 22 5 22C5 22 4.6 20 3 19C4.6 18 5 16 5 16Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </>
  )
}

export default AIGenerateSuggestions;