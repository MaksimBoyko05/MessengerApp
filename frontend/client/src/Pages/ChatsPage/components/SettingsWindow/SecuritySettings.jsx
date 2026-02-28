import {useState} from "react";
import {userService} from "@/api/userService.js";
import styles from "./Settings.module.scss"

function SecuritySettings({user}) {
  const [newPassword, setNewPassword] = useState({
    oldPassword: "",
    newPassword: ""
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const handleSubmit = async (e) => {
    try {
      const res = await userService.changePassword(user.id, newPassword.oldPassword, newPassword.newPassword)
    } catch (err) {
      console.error("Error with change pass", err)
    }
  }
  return (
    <>
      <div className={styles.changepassblock}>
        <div className={styles.changepasstitle}>
          <p onClick={() => setIsChangingPassword(true)}>Change Password?</p>
        </div>
        {isChangingPassword && (
          <div className={styles.passinputcontainer}>
            <input
              type={"password"}
              placeholder={"Current password"}
              value={newPassword.oldPassword}
              onChange={(e) => setNewPassword({...newPassword, oldPassword: e.target.value})}
            />
            <input
              type={"password"}
              placeholder={"New password"}
              value={newPassword.newPassword}
              onChange={(e) => setNewPassword({...newPassword, newPassword: e.target.value})}
            />
            <button
              className={styles.sbmbtn}
              onClick={handleSubmit}>Sumbit
            </button>
          </div>
        )}</div>
    </>
  )
}

export default SecuritySettings;