import {useState} from "react";
import styles from "../Authpage.module.scss";

function AuthTabs ({activeButton, setActiveButton}) {
  return (
    <>
      <div
        className={`chooseblock ${
          activeButton === "signup" ? "signup-active" : ""
        }`}
      >
        <div
          className={
            activeButton === "signin" ? "choose-active" : "inactive"
          }
          onClick={() => setActiveButton("signin")}
        >
          <p>Sign In</p>
        </div>
        <div
          className={
            activeButton === "signup" ? "choose-active" : "inactive"
          }
          onClick={() => setActiveButton("signup")}
        >
          <p>Sign Up</p>
        </div>
      </div>
    </>
  )
}
export default AuthTabs;
