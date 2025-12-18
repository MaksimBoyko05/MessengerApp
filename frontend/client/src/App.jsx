import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import styles from "./Pages/AuthPage/AuthPage.module.scss";
import AuthPage from "./Pages/AuthPage/AuthPage.jsx";
import ChatsPage from "./Pages/ChatsPage/ChatsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Користувач:", res.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Помилка перевірки токена", err);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <div className={styles.App}>
        <nav>
          <Link to="/authorization">Authorization</Link>
          <Link to="/chats">Chats</Link>
        </nav>
        <Routes>
          <Route path="/authorization" element={<AuthPage setIsAuthenticated={setIsAuthenticated} />}  />
          <Route
            path="/chats"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
                <ChatsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
