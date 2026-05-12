function AuthTabs({activeButton, setActiveButton}) {
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
          <p>Вхід</p>
        </div>
        <div
          className={
            activeButton === "signup" ? "choose-active" : "inactive"
          }
          onClick={() => setActiveButton("signup")}
        >
          <p>Реєстрація</p>
        </div>
      </div>
    </>
  )
}

export default AuthTabs;
