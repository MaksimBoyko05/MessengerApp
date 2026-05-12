import styles from "./Settings.module.scss";
import {Camera} from 'lucide-react';
import {useEffect, useRef, useState} from "react";
import {userService} from "@/api/userService.js";
import {toast} from "react-toastify";
import Avvvatars from 'avvvatars-react';

function ProfileSettings({user}) {
  const [data, setData] = useState({
    avatar_url: null,
    username: "",
  });
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [preview, setPreview] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);

  const API_URL = "http://localhost:5000";
  const filePickerRef = useRef(null);

  useEffect(() => {
    const fetchUserName = () => {
      setData({...data, username: user?.username || ""});
    };
    fetchUserName();
  }, [user?.username]);

  const handleImageClick = () => {
    filePickerRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files;
    if (file && file.length > 0) {
      setData({
        ...data,
        avatar_url: file[0]
      });
      const imageUrl = URL.createObjectURL(file[0]);
      setPreview(imageUrl);
      setIsChanged(true);
    }
  };

  const handleNameChange = (e) => {
    setData({...data, username: e.target.value});
    setIsChanged(true);
  };

  const handleSave = async () => {
    const payload = new FormData();
    payload.append("username", data.username);
    if (data.avatar_url) {
      payload.append("avatar", data.avatar_url);
    }
    try {
      await userService.updateUser(user.id, payload);
      toast.success("Профіль оновлено!");
      setIsChanged(false);
    } catch (err) {
      console.error("Error with update data", err);
      toast.error(err?.response?.data?.error || "Помилка оновлення");
    }
  };

  const onClose = () => {
    setNewEmail("");
    setChangeEmail(false);
  };

  const handleSendVerification = async () => {
    try {
      await userService.changeEmail(user.id, newEmail);
      toast.success("Лист надіслано");
      onClose();
    } catch (err) {
      console.error("Error with sending", err);
      toast.error(err?.response?.data?.error || "Помилка відправки");
    }
  };

  return (
    <div className={styles.profilesettingscontainer}>
      <div className={styles.profiletop}>

        {/* Клік тепер на всьому блоці аватарки */}
        <div
          className={styles.imgblock}
          onClick={handleImageClick}>
          <div className={styles.avatarWrapper}>
            {preview ? (
              <img
                alt="avatar"
                src={preview}/>
            ) : user?.avatar_url ? (
              <img
                alt="avatar"
                src={`${API_URL}${user.avatar_url}`}/>
            ) : (
              <Avvvatars
                value={user?.username || "U"}
                size={90}/>
            )}
          </div>

          <div className={styles.editimg}>
            <Camera/>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={filePickerRef}
            style={{display: 'none'}}
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.nameblock}>
          <div className={styles.namelabel}>
            <label>Ім'я</label>
          </div>
          <div className={styles.editnameblock}>
            <input
              type="text"
              value={data.username}
              onChange={handleNameChange}
            />
            {isChanged && (
              <button
                className={styles.savenamebtn}
                onClick={handleSave}>
                Зберегти
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.innerDivider}></div>

      <div className={styles.emailcontainer}>
        <p>Email</p>
        <div className={styles.emailblock}>
          <span>{user?.email}</span>
          {!changeEmail && (
            <button onClick={() => setChangeEmail(true)}>Змінити</button>
          )}
        </div>

        {changeEmail && (
          <>
            <div className={styles.newemailblock}>
              <input
                type="email"
                placeholder="Новий email"
                className={emailError ? styles.inputerror : ""}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onBlur={() => {
                  if (newEmail && !newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    setEmailError("Невірний формат");
                  } else {
                    setEmailError("");
                  }
                }}
              />
              <button
                disabled={emailError || newEmail.length < 1}
                onClick={handleSendVerification}
              >
                Віправити
              </button>
              <button
                style={{background: "#FF2C2C"}}
                onClick={onClose}
              >
                Відміна
              </button>
            </div>
            <div><p className={styles.error}>{emailError}</p></div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileSettings;