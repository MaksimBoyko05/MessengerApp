import {useState} from "react";
import {userService} from "@/api/userService.js";
import {ChevronLeft} from 'lucide-react';
import styles from "../Authpage.module.scss"
import {toast} from "react-toastify";

function SendResetPassEmail({setStatus}) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const handleSendEmail = async () => {
    try {
      await userService.forgotPassword(email)
      toast.success("Лист надіслано")
    } catch (err) {
      toast.error(err.response?.data?.error || "Помилка надсилання листа")
    }
  }
  const handleCLose = () => {
    setEmail("")
    setStatus("Auth")
  }
  return (
    <>
      <div className={styles.backbntchevrone}>
        <ChevronLeft onClick={handleCLose}/>
      </div>
      <div className={styles.sendmailcontainer}>
        <label>Ваш email:</label>
        <input
          type={"email"}
          value={email}
          className={emailError ? styles.inputerror : ""}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => {
            if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              setEmailError("Невірний формат");
            } else {
              setEmailError("");
            }
          }}
        />
        <p className={styles.error}>{emailError}</p>
        <button
          disabled={emailError || email.length < 1}
          onClick={handleSendEmail}>Надіслати
        </button>
      </div>
    </>
  )
}

export default SendResetPassEmail;