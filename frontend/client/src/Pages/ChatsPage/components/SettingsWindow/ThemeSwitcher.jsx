import React, {useState} from 'react';
import styles from './Settings.module.scss';
import {userService} from "@/api/userService.js";

const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState('light');

  const handleThemeClick = async (theme) => {
    setActiveTheme(theme);
    try {
      await userService.updateTheme(theme)
    } catch (err) {
      console.error("Error with changing theme", err)
    }
  };

  return (
    <div className={styles.themeSwitcher}>
      <h2 className={styles.title}>Switch theme</h2>
      <div className={styles.themesContainer}>
        <div
          className={`${styles.themeCard} ${activeTheme === 'light' ? styles.active : ''}`}
          onClick={() => handleThemeClick('light')}
        >
          <div className={`${styles.themePreview} ${styles.lightPreview}`}>
            <div className={styles.previewHeader}></div>
            <div className={styles.previewMessages}>
              <div className={styles.messageLeft}></div>
              <div className={styles.messageRight}></div>
              <div className={styles.messageLeft}></div>
              <div className={styles.messageRight}></div>
              <div className={styles.messageLeft}></div>
            </div>
            <div className={styles.previewInput}></div>
          </div>
          <div className={styles.themeLabel}>Light</div>
          <div className={styles.selectionIndicator}></div>
        </div>

        <div
          className={`${styles.themeCard} ${activeTheme === 'dark' ? styles.active : ''}`}
          onClick={() => handleThemeClick('dark')}
        >
          <div className={`${styles.themePreview} ${styles.darkPreview}`}>
            <div className={styles.previewHeader}></div>
            <div className={styles.previewMessages}>
              <div className={styles.messageLeft}></div>
              <div className={styles.messageRight}></div>
              <div className={styles.messageLeft}></div>
              <div className={styles.messageRight}></div>
              <div className={styles.messageLeft}></div>
            </div>
            <div className={styles.previewInput}></div>
          </div>
          <div className={styles.themeLabel}>Dark</div>
          <div className={styles.selectionIndicator}></div>
        </div>

        <div
          className={`${styles.themeCard} ${activeTheme === 'glass' ? styles.active : ''}`}
          onClick={() => handleThemeClick('glass')}
        >
          <div className={`${styles.themePreview} ${styles.glassPreview}`}>
            <div className={styles.previewHeader}></div>
            <div className={styles.previewMessages}>
              <div className={styles.messageLeft}></div>
              <div className={styles.messageRight}></div>
              <div className={styles.messageLeft}></div>
              <div className={styles.messageRight}></div>
              <div className={styles.messageLeft}></div>
            </div>
            <div className={styles.previewInput}></div>
          </div>
          <div className={styles.themeLabel}>Glass</div>
          <div className={styles.selectionIndicator}></div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;