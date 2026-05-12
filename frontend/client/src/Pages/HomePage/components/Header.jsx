import {Link} from "react-router-dom";
import styles from "../Home.module.scss";
import {MessageSquare} from "lucide-react";

function Header() {
  return (
    <header className={styles.headerContainer}>
      <nav className={styles.navBar}>
        <Link
          to="/"
          className={styles.logo}>
          <MessageSquare
            size={24}
            className={styles.logoIcon}/>
          Lysto
        </Link>
        <div className={styles.headerMenu}>
          <Link
            to="/authorization"
            className={styles.navLink}>Авторизація</Link>
          <Link
            to="/chats"
            className={styles.primaryBtnSmall}>Відкрити чати</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;