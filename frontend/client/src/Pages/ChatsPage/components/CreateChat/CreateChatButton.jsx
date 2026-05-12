import {Plus} from 'lucide-react';
import styles from './CreateChat.module.scss'

function createChatButton({setIsOpen}) {
  return (
    <>
      <button
        className={styles.button}
        onClick={() => setIsOpen((prev) => (prev === false))}>
        <Plus/>
      </button>
    </>
  );
}

export default createChatButton;