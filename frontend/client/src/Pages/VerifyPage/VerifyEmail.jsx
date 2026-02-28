import {useSearchParams, useNavigate} from 'react-router-dom';
import {useEffect, useState} from "react";
import {userService} from "@/api/userService.js";
import styles from "./Verify.module.scss"

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();


  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Link is not valid")
      return;
    }
    const verifyEmail = async () => {
      try {
        await userService.verifyEmail(token)
        setStatus("success");
        setTimeout(() => {
          navigate("/chats");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.response?.data?.error || "Error with email verification");
      }
    }
    verifyEmail();
  }, [token, navigate]);
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
      {status === "success" && (
        <div className={styles.successblock}>
          <h4>Email has changed!</h4>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;