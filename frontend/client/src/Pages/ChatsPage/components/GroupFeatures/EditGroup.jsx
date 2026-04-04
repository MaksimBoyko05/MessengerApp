import {useContext, useEffect, useRef, useState} from "react";
import {ChatContext} from "@/context/ChatContext.jsx";
import {SwitchCamera, Check, ChevronLeft} from 'lucide-react';
import styles from "./GroupDetails.module.scss"
import {chatsService} from "@/api/chatsService.js";
import Avvvatars from 'avvvatars-react'
import {userService} from "@/api/userService.js";
import {toast} from "react-toastify";

function EditGroup({chatId, setIsEditing}) {
  const {chatDetails, setChatDetails} = useContext(ChatContext) || {};
  const [data, setData] = useState({
    avatar_url: null,
    newName: ""
  })
  const [newName, setNewName] = useState(chatDetails.name);
  const [preview, setPreview] = useState("");
  const filePickerRef = useRef(null);
  const API_URL = "http://localhost:5000";


  const handleChange = (e) => {
    setNewName(e.target.value)
  }
  const handleImageClick = () => {
    filePickerRef.current.click();
  }

  const handleFileChange = (e) => {
    const file = e.target.files;
    if (file && file.length > 0) {
      setData({
        ...data,
        avatar_url: file[0]
      });
      const imageUrl = URL.createObjectURL(file[0]);
      setPreview(imageUrl);
    }
  }
  const handleSave = async () => {
    if (newName !== data.name) {
      try {
        await chatsService.updateGroupName(chatId, newName)
        setIsEditing(false)
      } catch (err) {
        console.error("Error with changing name", err)
        toast.error(err.response?.data?.error || "Помилка оновлення")
      }
    }
    if (data.avatar_url) {
      const payload = new FormData();
      payload.append("avatar", data.avatar_url);
      try {
        await chatsService.uploadGroupImage(chatId, payload)
        setIsEditing(false)
      } catch (err) {
        console.error("Error with update data", err)
        toast.error(err.response?.data?.error || "Помилка оновлення")
      }
    }
  }
  const handleBack = () => {
    setNewName("");
    setData({
      newName: null,
      avatar_url: ""
    })
    setIsEditing(false)
  }
  useEffect(() => {
    const fetchUserName = () => {
      setData({...data, name: chatDetails.name})
    }
    fetchUserName();
  }, [chatDetails.name]);


  return (
    <>
      <ChevronLeft
        onClick={handleBack}
        className={styles.backbtn}/>
      <div className={styles.editcontainer}>
        <div className={styles.infoblock}>
          {chatDetails.avatar_url || preview ? (
            <img
              alt={"groupimg"}
              src={preview ? preview : `${API_URL}${chatDetails.avatar_url}`}/>
          ) : (
            <Avvvatars
              size={48}
              value={chatDetails.name}/>
          )}
          <input
            name={"groupname"}
            value={newName}
            onChange={(e) => handleChange(e)}
          />
          <Check
            onClick={handleSave}
            size={20}/>
        </div>
        <div
          onClick={handleImageClick}
          className={styles.addphoto}><SwitchCamera/>
          <p>Змінити світлину</p>
          <input
            type={"file"}
            ref={filePickerRef}
            style={{display: 'none'}}
            onChange={(e) => handleFileChange(e)}/>
        </div>
      </div>
    </>
  )
}

export default EditGroup;