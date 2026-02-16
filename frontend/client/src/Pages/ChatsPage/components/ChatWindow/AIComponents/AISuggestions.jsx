import styles from "./AISuggestions.module.scss"

function AISuggestions({suggestions, onSelect}) {
  return (
    <>
      {suggestions.length > 0 && (
        <div className={styles.chipcontainer}>
          {suggestions.map((text, index) => (
            <button
              key={index}
              className={styles.suggestionchip}
              onClick={() => onSelect(text)}
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default AISuggestions;