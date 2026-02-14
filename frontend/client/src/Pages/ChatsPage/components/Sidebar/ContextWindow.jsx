import styles from "@/Pages/ChatsPage/Chats.module.scss";
import {Trash} from 'lucide-react';

function ContextWindow({x, y, handleDelete}) {
  const menuHeight = 135;
  const menuWidth = 150;
  const isOutBelow = y + menuHeight > window.innerHeight;
  const isOutSidebar = x + menuWidth > 340;
  const left = isOutSidebar ? x - menuWidth : x;
  const top = isOutBelow ? y - menuHeight : y;
  return (
    <div
      style={{top: top + 'px', left: left + 'px', position: "fixed"}}>
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