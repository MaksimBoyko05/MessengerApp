import {useState} from "react";
import {userService} from "@/api/userService.js";
import styles from "./Settings.module.scss"
import {toast} from "react-toastify";

function SecuritySettings({user}) {
  const [newPassword, setNewPassword] = useState({
    oldPassword: "",
    newPassword: ""
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const handleSubmit = async (e) => {
    try {
      const res = await userService.changePassword(user.id, newPassword.oldPassword, newPassword.newPassword)
      toast.success("Пароль змінено!")
    } catch (err) {
      console.error("Error with change pass", err)
      toast.error(err.response?.data.error)
    }
  }
  return (
    <>
      <div className={styles.changepassblock}>
        <div className={styles.changepasstitle}>
          <p onClick={() => setIsChangingPassword(true)}>Змінити пароль?</p>
        </div>
        {isChangingPassword && (
          <div className={styles.passinputcontainer}>
            <input
              type={"password"}
              placeholder={"Поточний пароль"}
              value={newPassword.oldPassword}
              className={passwordError ? styles.inputerror : ""}
              onChange={(e) => setNewPassword({...newPassword, oldPassword: e.target.value})}
              onBlur={() => {
                if (newPassword.oldPassword.length < 8) {
                  setPasswordError("Пароль має бути від 8 символів");
                } else {
                  setPasswordError("");
                }
              }}
            />
            <input
              type={"password"}
              placeholder={"Новий пароль"}
              value={newPassword.newPassword}
              className={newPasswordError ? styles.inputerror : ""}
              onChange={(e) => setNewPassword({...newPassword, newPassword: e.target.value})}
              onBlur={() => {
                if (newPassword.newPassword.length < 8) {
                  setNewPasswordError("Пароль має бути від 8 символів");
                } else if (newPassword.newPassword === newPassword.oldPassword) {
                  setNewPasswordError("Новий пароль не може співпадати зі старим");
                } else {
                  setNewPasswordError("")
                }
              }}
            />
            <p className={styles.error}>{newPasswordError}</p>
            <button
              className={styles.sbmbtn}
              disabled={newPasswordError || newPassword.newPassword.length < 1}
              onClick={handleSubmit}>
              Зберегти
            </button>
          </div>
        )}</div>
    </>
  )
}

export default SecuritySettings;