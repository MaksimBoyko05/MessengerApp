import {useState} from "react";
import {aiService} from "@/api/aiService.js";
import {X} from 'lucide-react';
import styles from "./AISuggestions.module.scss"
import {Sparkles} from 'lucide-react';

function AskAI({chatId, showPopup}) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    setIsLoading(true);
    try {
      await aiService.askAi(chatId, query)
      setQuery("");
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
          <h4>Запитайте AI </h4>
          <button
            className={styles.closebutton}
            onClick={onClose}><X size={14}/></button>
          <textarea
            type={"text"}
            placeholder={"Чим вам допомогти?"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={1}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            className={styles.sendbutton}
            disabled={query.length < 1}
            onClick={handleSend}>
            Запитати
          </button>
          {isLoading && (
            <>
              <div className={styles.loadingelements}>
                <Sparkles className={styles.sparkle}/>
                <Sparkles className={styles.sparkle}/>
                <Sparkles
                  className={styles.sparkle}
                  size={56}/>
                <Sparkles className={styles.sparkle}/>
                <Sparkles className={styles.sparkle}/>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default AskAI;