import {useState} from "react";
import {userService} from "@/api/userService.js";

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
      <div>
        <p onClick={() => setIsChangingPassword(true)}>Change Password?</p>
      </div>
      {isChangingPassword && (
        <div>
          <input
            type={"text"}
            placeholder={"old password"}
            value={newPassword.oldPassword}
            onChange={(e) => setNewPassword({...newPassword, oldPassword: e.target.value})}
          />
          <input
            type={"text"}
            placeholder={"new password"}
            value={newPassword.newPassword}
            onChange={(e) => setNewPassword({...newPassword, newPassword: e.target.value})}
          />
          <button onClick={handleSubmit}>Sumbit</button>
        </div>
      )}
    </>
  )
}

export default SecuritySettings;