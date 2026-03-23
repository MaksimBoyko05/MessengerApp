import {useContext, useState} from "react";
import {useNavigate} from "react-router";
import axios from "axios";
import {Eye, EyeOff} from 'lucide-react';
import logo from "../../loginlogo.png";
import AuthTabs from "./components/AuthTabs.jsx";
import styles from "./Authpage.module.scss";
import UserContext from "../../context/UserContext";
import SendResetPassEmail from "@/Pages/AuthPage/components/SendResetPassEmail.jsx";

function AuthPage() {
  const {checkAuth} = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [activeButton, setActiveButton] = useState("signin");
  const [status, setStatus] = useState("Auth")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  function generateUsername() {
    const randomNum = Math.floor(Math.random() * 10000);
    return "user" + randomNum;
  }

  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeButton === "signup") {
      if (!confirmPassword) {
        setMessage("Будь ласка, підтвердіть пароль.");
        return;
      }
      if (password !== confirmPassword) {
        setMessage("Паролі не співпадають.");
        return;
      }
    }

    if (email && password) {
      setIsLoading(true);
      try {
        if (activeButton === "signup") {
          const res = await axios.post("http://localhost:5000/api/auth/register", {
            username: generateUsername(),
            email,
            password,
          });
          setMessage(res.data.message || "Реєстрація успішна! Тепер ви можете увійти.");
          setActiveButton("signin");
        } else {
          const res = await axios.post("http://localhost:5000/api/auth/login", {
            email,
            password,
          });

          localStorage.setItem("token", res.data.token);

          await checkAuth();

          setMessage("Вхід успішний!");
          navigate("/chats");
        }
      } catch (err) {
        setMessage(err.response?.data?.error || "Сталася помилка");
      } finally {
        setIsLoading(false);
      }
    } else {
      setMessage("Будь ласка, заповніть всі поля.");
    }
  };

  return (
    <div className={styles.parentcontainer}>
      <div className={styles.formBlock}>
        <div className={styles.logoDiv}>
          <img
            className={styles.logo}
            src={logo}
            alt="logo"/>
        </div>
        <h1 className={styles.LogoText}>Lysto</h1>
        <div className={styles.formContainer}>
          {status === "Auth" ? (
            <>
              <AuthTabs
                activeButton={activeButton}
                setActiveButton={setActiveButton}/>
              <form onSubmit={handleSubmit}>
                <div
                  className={`input-group ${
                    email || isFocused.email ? "active" : ""
                  }`}
                >
                  <label className={styles.labelEmail}>Email</label>
                  <input
                    className={`formInput ${
                      !isFocused.email && emailError ? "input-error" : ""
                    }`}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    onFocus={() => {
                      setIsFocused({...isFocused, email: true});
                    }}
                    onBlur={() => {
                      setIsFocused({...isFocused, email: false});
                      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                        setEmailError("Невірний формат");
                      } else {
                        setEmailError("");
                      }
                    }}
                  />
                  {!isFocused.email && emailError && email && (
                    <p className={styles.error}>{emailError}</p>
                  )}
                </div>
                <div
                  className={`input-group ${
                    password || isFocused.password ? "active" : ""
                  }`}
                >
                  <label className={styles.labelPass}>Пароль</label>
                  <input
                    className={`formInput ${
                      !isFocused.password && passwordError ? "input-error" : ""
                    }`}
                    type={showPassword === true ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    onFocus={() => setIsFocused({...isFocused, password: true})}
                    onBlur={() => {
                      setIsFocused({...isFocused, password: false});
                      if (password && password.length < 8) {
                        setPasswordError("Пароль має бути від 8 символів");
                      } else {
                        setPasswordError("");
                      }
                    }}
                  ></input>
                  <button
                    className={styles.showPassBtn}
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => (prev === false ? true : false))
                    }
                  >
                    {showPassword === true ? (
                      <Eye/>
                    ) : (
                      <EyeOff/>
                    )}
                  </button>
                </div>
                {!isFocused.password && passwordError && password && (
                  <p className={styles.error}>{passwordError}</p>
                )}

                {activeButton === "signup" && (
                  <div
                    className={`input-group ${
                      confirmPassword || isFocused.confirmPassword ? "active" : ""
                    }`}
                  >
                    <label className={styles.labelConfirmPass}>Підтвердіть пароль</label>
                    <input
                      className={`formInput ${
                        !isFocused.confirmPassword && confirmPasswordError ? "input-error" : ""
                      }`}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() =>
                        setIsFocused({...isFocused, confirmPassword: true})
                      }
                      onBlur={() => {
                        setIsFocused({...isFocused, confirmPassword: false});
                        if (confirmPassword && confirmPassword !== password) {
                          setConfirmPasswordError("Паролі не співпадають");
                        } else {
                          setConfirmPasswordError("");
                        }
                      }}
                    />
                    <button
                      className={styles.showPassBtn}
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <Eye/>
                      ) : (
                        <EyeOff/>
                      )}
                    </button>
                  </div>
                )}
                <p className={styles.error}>{confirmPasswordError}</p>
                {activeButton === "signin" && (
                  <p
                    className={styles.forgotpass}
                    onClick={() => setStatus("ForgotPass")}
                  >
                    Забули пароль?
                  </p>
                )}
                <div className={styles.buttoncontainer}>
                  <button
                    className={styles.sbmbutton}
                    type="submit"
                    disabled={
                      isLoading ||
                      !email ||
                      !password ||
                      emailError ||
                      passwordError ||
                      (activeButton === "signup" && !confirmPassword)
                    }
                  >
                    {isLoading ? "Завантаження" : activeButton === "signin" ? "Увійти" : "Зареєструватися"}
                  </button>
                </div>
                {message && <p className={styles.error}>{message}</p>}
              </form>
            </>
          ) : (
            <>
              <SendResetPassEmail setStatus={setStatus}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
