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
import AuthPage from "./Pages/AuthPage";
import Chats from "./Pages/Chats";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/auth/me", {
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
      <div className="App">
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
                <Chats />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
