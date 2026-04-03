import styles from "./AISuggestions.module.scss"
import {aiService} from "@/api/aiService.js";
import {X} from 'lucide-react';

function AISuggestions({suggestions, onSetSuggestions, onSelect}) {

  const allSuggestionIds = suggestions.map(item => item.id)

  const handleSend = async (suggestionId) => {
    try {
      await aiService.sendAnalyticsUsage(suggestionId, allSuggestionIds)
    } catch (err) {
      console.error("Error with sending suggestion analytics", err)
    }
  }
  const handleSendIgnored = async () => {
    try {
      await aiService.sendAnalyticsIgnored(allSuggestionIds)
    } catch (err) {
      console.error("Error with sending suggestion ignored analytics", err)
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
          <div className={styles.closesuggestions}><X
            size={16}
            onClick={() => {
              handleSendIgnored();
              onSetSuggestions([]);
            }
            }/></div>
        </div>
      )}
    </>
  );
}

export default AISuggestions;