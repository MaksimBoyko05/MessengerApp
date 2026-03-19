import {Search} from 'lucide-react';
import styles from "../../Chats.module.scss";

function SearchBlock({onSearchQuery, onSetSearchQuery}) {
  return (
    <>
      <div className={styles.searchdiv}>
        <Search
          size={20}
          color={"#666"}/>
        <input
          type="search"
          placeholder="Шукати чати..."
          value={onSearchQuery}
          onChange={(e) => onSetSearchQuery(e.target.value)}
        />
      </div>
    </>
  )
}

export default SearchBlock;