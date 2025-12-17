import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Chats.css";
import Profile from "../components/Chats/Profile.jsx";
function Chats() {
  

  return (
    <div className="wrapper">
      <div className="profile">
            <Profile/>
      </div>
    </div>
  );
}
export default Chats;
