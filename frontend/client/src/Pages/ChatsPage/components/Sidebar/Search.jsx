import {Search} from 'lucide-react';
import styles from "../../Chats.module.scss";

function SearchBlock() {
  return (
    <>
      <div className={styles.searchdiv}>
        <Search/>
        <input
          type="search"
          placeholder="Search chats.."/>
      </div>
    </>
  )
}

export default SearchBlock;