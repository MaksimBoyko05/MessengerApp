import {useState} from "react";
import {aiService} from "@/api/aiService.js";
import {X} from 'lucide-react';
import styles from "./AISuggestions.module.scss"

function AskAI({chatId, showPopup}) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    try {
      await aiService.askAi(chatId, query)
      setIsLoading(true);
    } catch (err) {
      console.error("Error with asking AI", err)
    } finally {
      setIsLoading(false)
      onClose();
    }
  }
  const onClose = () => {
    setQuery("")
    showPopup(false)
  }
  return (
    <>
      <div className={styles.askAipopupwrapper}>
        <div className={styles.popupcontent}>
          <h4>Ask AI </h4>
          <button
            className={styles.closebutton}
            onClick={onClose}><X size={14}/></button>
          <input
            type={"text"}
            placeholder={"How can I help you?"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className={styles.sendbutton}
            disabled={query.length < 1}
            onClick={handleSend}>Send request
          </button>
        </div>
      </div>
    </>
  )
}

export default AskAI;