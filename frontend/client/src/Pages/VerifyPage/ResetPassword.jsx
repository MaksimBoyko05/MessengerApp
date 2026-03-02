import {useSearchParams, useNavigate} from 'react-router-dom';
import {useEffect, useState} from "react";
import {userService} from "@/api/userService.js";
import styles from "./Verify.module.scss"

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const token = searchParams.get('token');
  const navigate = useNavigate();


  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Link is not valid")
    }
    setStatus("waiting")
  }, [token, navigate]);

  const handleSavePassword = async () => {
    try {
      await userService.resetPassword(token, newPassword)
      setStatus("success");
      setTimeout(() => {
        navigate("/authorization");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.response?.data?.error || "Error with changing password");
    }
  }
  return (
    <div className={styles.emailcontainer}>
      {status === "loading" && (
        <div className={styles.loadingblock}>
          <h4>Token verification... ⏳</h4>
        </div>
      )}
      {status === "error" && (
        <div className={styles.errorblock}>
          <h4>Error</h4>
          <p>{errorMessage}</p>
        </div>
      )}
      {status === "waiting" && (
        <div className={styles.newpassblock}>
          <h4>Set new password</h4>
          <input
            type={"password"}
            value={newPassword}
            placeholder={"New password"}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleSavePassword}>Save</button>
        </div>
      )}
      {status === "success" && (
        <div className={styles.successblock}>
          <h4>Password has changed!</h4>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;