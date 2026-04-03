import styles from "./AISuggestions.module.scss"
import {aiService} from "@/api/aiService.js";
import {X} from 'lucide-react';

function AISuggestions({suggestions, onSetSuggestions, onSelect}) {
  const handleSend = async (suggestionId) => {
    try {
      await aiService.sendAnalytics(suggestionId)
    } catch (err) {
      console.error("Error with sending suggestion to DB", err)
    }
  }
  return (
    <>
      {suggestions.length > 0 && (
        <div className={styles.chipcontainer}>
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              className={styles.suggestionchip}
              onClick={() => {
                onSelect(sug.text);
                handleSend(sug.id);
              }}
            >
              {sug.text}
            </button>
          ))}
          <X onClick={() => onSetSuggestions([])}/>
        </div>
      )}
    </>
  );
}

export default AISuggestions;