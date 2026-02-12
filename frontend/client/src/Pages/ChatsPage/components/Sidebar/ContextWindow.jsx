import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Trash} from 'lucide-react';

function ContextWindow({x, y, handleDelete}) {
  return (
    <div
      style={{top: y + 'px', left: x + 'px', position: "fixed"}}>
      <div className={styles.contextmenu}>
        <p>Placeholder1</p>
        <p>Placeholder2</p>
        <p
          className={styles.delete}
          onClick={() => handleDelete(false)}><Trash size={16}/>Видалити у мене</p>
        <p
          className={styles.delete}
          onClick={() => handleDelete(true)}><Trash size={16}/>Видалити для всіх</p>
      </div>
    </div>
  );
}

export default ContextWindow;