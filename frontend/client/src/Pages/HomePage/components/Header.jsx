import {Link} from "react-router-dom";
import styles from "../Home.module.scss"

function Header() {
  return (
    <header>
      <nav className={styles.header}>
        <Link to="/">Lysto</Link>
        <div className={styles.headermenu}>
          <Link to="/authorization">Authorization</Link>
          <Link to="/chats">Chats</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;