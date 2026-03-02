import {useState} from "react";
import {userService} from "@/api/userService.js";
import {ChevronLeft} from 'lucide-react';
import styles from "../Authpage.module.scss"

function SendResetPassEmail({setStatus}) {
  const [email, setEmail] = useState("")
  const handleSendEmail = async () => {
    try {
      await userService.forgotPassword(email)
      console.log("Email was send")
    } catch (err) {
      console.error("Error  with sending reset pass mail", err)
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
        <label>Your account email:</label>
        <input
          type={"email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}/>
        <button onClick={handleSendEmail}>Send</button>
      </div>
    </>
  )
}

export default SendResetPassEmail;