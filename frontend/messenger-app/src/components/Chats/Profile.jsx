import { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
function Profile() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [userimg, setUserimg] = useState("");
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Користувач:", res.data.user);
          setUserId(res.data.user.id);
          console.log(res.data.user.id);
        } catch (err) {
          console.error("Помилка отримання даних користувача", err);
          localStorage.removeItem("token");
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token && userId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUsername(res.data.username);
          setUserimg(res.data.avatar_url);
        } catch (err) {
          console.error("Помилка отримання даних користувача", err);
          localStorage.removeItem("token");
        }
      }
    };
    fetchUserData();
  }, [userId]);

  return (
    <div className="profileblock">
      <img className="avatarImg" src={userimg} alt="avatar" />
      <p className="usertitle">{username}</p>
    </div>
  );
}
export default Profile;
