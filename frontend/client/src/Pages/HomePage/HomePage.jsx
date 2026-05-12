import Header from "./components/Header.jsx";
import styles from "./Home.module.scss";
import {ArrowRight, Bot, CheckCircle2, MessageSquare, Sparkles, Users, Zap} from "lucide-react";
import {Link} from "react-router-dom";

function HomePage() {
  return (
    <div className={styles.homeWrapper}>
      <div className={styles.bgGradients}></div>
      <Header/>
      <main className={styles.mainContent}>

        <section className={styles.heroSection}>
          <div className={styles.badge}>
            <Sparkles size={16}/>
            <span>Нова ера спілкування</span>
          </div>
          <h1 className={styles.title}>
            Ваш месенджер став <span className={styles.highlight}>розумнішим</span>.
          </h1>
          <p className={styles.subtitle}>
            Відповіді на основі ШІ одним дотиком, генерація ідей та миттєвий переклад.
            Спробуйте новий рівень комунікації, де технології розуміють вас з півслова.
          </p>
          <div className={styles.actionBtns}>
            <Link
              to="/authorization"
              className={styles.primaryBtn}>
              Розпочати безкоштовно <ArrowRight size={18}/>
            </Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <Bot size={28}/>
            </div>
            <h3>Вбудований ШІ</h3>
            <p>Аналізує контекст діалогу та пропонує доречні варіанти відповідей, економлячи ваш час.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <Users size={28}/>
            </div>
            <h3>Групові чати</h3>
            <p>Створюйте спільноти, запрошуйте друзів та обговорюйте спільні ідеї у зручному форматі.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <Zap size={28}/>
            </div>
            <h3>Блискавична швидкість</h3>
            <p>Миттєва доставка повідомлень, плавний інтерфейс та оптимізована робота на всіх пристроях.</p>
          </div>
        </section>

        <section className={styles.demoSection}>
          <div className={styles.demoRow}>
            <div className={styles.demoText}>
              <div className={styles.demoIcon}>
                <MessageSquare size={24}/>
              </div>
              <h2>Розумні підказки у реальному часі</h2>
              <p>
                Більше не потрібно друкувати довгі відповіді на ходу. Наш ШІ миттєво аналізує вхідне повідомлення та
                генерує три найбільш релевантні варіанти відповіді.
              </p>
              <ul className={styles.demoList}>
                <li><CheckCircle2 size={18}/> Точне розуміння контексту</li>
                <li><CheckCircle2 size={18}/> Адаптація під ваш стиль спілкування</li>
                <li><CheckCircle2 size={18}/> Відправка в один клік</li>
              </ul>
            </div>

            <div className={styles.chatDemoCard}>
              <div className={styles.chatHeader}>
                <div className={styles.avatar}></div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>Олександр</span>
                  <span className={styles.userStatus}>Онлайн</span>
                </div>
              </div>
              <div className={styles.messagesArea}>
                <div className={styles.messageRow}>
                  <div className={styles.msgbubble}>
                    <p>Привіт! У нас завтра о 10:00 зустріч щодо нового дизайну. Ти будеш?</p>
                  </div>
                </div>
              </div>
              <div className={styles.chipcontainer}>
                <div className={styles.suggestionchip}>Так, буду обов'язково!</div>
                <div className={styles.suggestionchip}>Привіт. Запізнюсь на 10 хв.</div>
                <div className={styles.suggestionchip}>Можемо перенести на 11?</div>
              </div>
              <div className={styles.sendcomponent}>
                <input
                  type="text"
                  className={styles.textfield}
                  placeholder="Ваше повідомлення..."
                  disabled/>
                <button className={styles.askAibtn}><Sparkles size={16}/></button>
              </div>
            </div>
          </div>

          <div className={`${styles.demoRow} ${styles.reverse}`}>
            <div className={styles.demoText}>
              <div className={styles.demoIcon}>
                <Bot size={24}/>
              </div>
              <h2>Ваш особистий ШІ-асистент у чаті</h2>
              <p>
                Викликайте ШІ-помічника прямо під час діалогу. Потрібно перекласти текст, придумати ідею для подарунка
                чи написати офіційний лист? Просто запитайте.
              </p>
              <ul className={styles.demoList}>
                <li><CheckCircle2 size={18}/> Генерація тексту будь-якої складності</li>
                <li><CheckCircle2 size={18}/> Переклад на льоту</li>
                <li><CheckCircle2 size={18}/> Зручне спливаюче вікно</li>
              </ul>
            </div>

            <div className={styles.chatDemoCard}>
              <div className={styles.chatHeader}>
                <div className={styles.avatar}></div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>Олена</span>
                  <span className={styles.userStatus}>Була вчора</span>
                </div>
              </div>
              <div className={styles.messagesArea}>
                <div className={styles.messageRowRight}>
                  <div className={styles.mymsg}>
                    <p>Потрібно написати їм ввічливу відмову.</p>
                  </div>
                </div>
              </div>

              <div className={styles.aiPopupOverlay}>
                <div className={styles.popupcontent}>
                  <div className={styles.popupHeader}>
                    <Sparkles
                      size={18}
                      className={styles.sparkleIcon}/>
                    <h4>Запитайте у ШІ</h4>
                  </div>
                  <input
                    type="text"
                    value="Напиши ввічливу відмову від пропозиції співпраці"
                    readOnly/>
                  <button className={styles.sendbutton}>Згенерувати</button>
                </div>
              </div>

              <div className={styles.sendcomponent}>
                <input
                  type="text"
                  className={styles.textfield}
                  placeholder="Ваше повідомлення..."
                  disabled/>
                <button className={styles.askAibtn}><Sparkles size={16}/></button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2>Готові змінити свій підхід до спілкування?</h2>
          <p>Приєднуйтесь до Lysto сьогодні та отримайте доступ до всіх можливостей ШІ безкоштовно.</p>
          <Link
            to="/authorization"
            className={styles.primaryBtn}>
            Створити акаунт <ArrowRight size={18}/>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default HomePage;