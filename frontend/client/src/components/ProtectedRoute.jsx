import {useContext} from "react";
import {Navigate} from "react-router-dom";
import {UserContext} from "../context/UserContext";
import styles from "@/Pages/ChatsPage/Chats.module.scss";

const ProtectedRoute = ({children}) => {
  const {user, loading} = useContext(UserContext);
  if (loading) {
    return <div className={styles.loading}></div>;
  }

  if (!user) {
    return <Navigate
      to="/authorization"
      replace/>;
  }

  return children;
};

export default ProtectedRoute;