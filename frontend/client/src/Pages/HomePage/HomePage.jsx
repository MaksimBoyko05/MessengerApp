import logo from "../../../assets/images/head.png"
import Header from "./components/Header.jsx";
import styles from "./Home.module.scss"

function HomePage() {
  return (
    <>
      <Header/>
      <img
        alt="headimg"
        src={logo}/>
      <div className={styles.herosection}>
        <p>
          Your messenger just got smarter. AI-powered replies on tap
        </p>
        <div className={styles.actionbtns}>
          <div className={styles.leftbtn}>Get Started</div>
          <div className={styles.rightbtn}>Sign In</div>
        </div>
      </div>
    </>
  );
}

export default HomePage;