import {useSearchParams, useNavigate} from 'react-router-dom';
import {useEffect, useState} from "react";
import {userService} from "@/api/userService.js";
import styles from "./Verify.module.scss"

function VerifyEmail() {
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [errorMessage, setErrorMessage] = useState("")

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(!token ? "error" : "waiting");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await userService.verifyResetToken(token)
      } catch (err) {
        console.error(err.response?.data?.error)
        setStatus("error");
        setErrorMessage(err.response?.data?.error || "Помилка токену")
      }
    }
    verifyToken();
  }, [token]);


  const handleSavePassword = async () => {
    try {
      await userService.resetPassword(token, newPassword)
      setStatus("success");
      setTimeout(() => {
        navigate("/authorization");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.response?.data?.error || "Помилка при зміні паролю");
    }
  }
  return (
    <div className={styles.emailcontainer}>
      {status === "loading" && (
        <div className={styles.loadingblock}>
          <h4>Перевірка токену... ⏳</h4>
        </div>
      )}
      {status === "error" && (
        <div className={styles.errorblock}>
          <h4>Помилка</h4>
          <p>{errorMessage}</p>
        </div>
      )}
      {status === "waiting" && (
        <div className={styles.newpassblock}>
          <h4>Зміна паролю</h4>
          <input
            type={"password"}
            value={newPassword}
            placeholder={"Новий пароль"}
            className={passwordError ? styles.inputerror : ""}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => {
              if (newPassword.length < 8) {
                setPasswordError("Пароль має бути від 8 символів");
              } else {
                setPasswordError("");
              }
            }}
          />
          <p className={styles.error}>{passwordError}</p>
          <button
            disabled={passwordError || newPassword.length < 1}
            onClick={handleSavePassword}>Зберегти
          </button>
        </div>
      )}
      {status === "success" && (
        <div className={styles.successblock}>
          <h4>Пароль змінено!</h4>
          <p>Повернення...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;