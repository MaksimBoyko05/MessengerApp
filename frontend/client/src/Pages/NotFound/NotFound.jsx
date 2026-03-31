import React from 'react';
import {useNavigate} from 'react-router-dom';
import {MoveLeft, Ghost} from 'lucide-react';
import styles from './NotFound.module.scss';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.backgroundBlur}/>

      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Ghost
            size={80}
            strokeWidth={1.5}
            className={styles.icon}/>
        </div>

        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Сторінку не знайдено</h2>
        <p className={styles.description}>
          Схоже, що шлях, яким ви намагалися пройти, більше не існує або був переміщений.
        </p>

        <button
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          <MoveLeft size={20}/>
          <span>Повернутися на головну</span>
        </button>
      </div>

      <div className={styles.footer}>
        <p>© 2026 Lysto Messenger. Всі права захищені.</p>
      </div>
    </div>
  );
};

export default NotFound;