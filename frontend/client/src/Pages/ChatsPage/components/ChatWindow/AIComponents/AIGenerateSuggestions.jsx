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
          <Sparkles
            size={16}
            color={"#1f5aee"}
            className={isLoading ? styles.animatespin : ""}/>
        </button>
      )}
    </>
  )
}

export default AIGenerateSuggestions;