import {BrowserRouter as Router, Link, Route, Routes} from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import Header from "./Pages/HomePage/components/Header.jsx"
import AuthPage from "./Pages/AuthPage/AuthPage.jsx";
import ChatsPage from "./Pages/ChatsPage/ChatsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {UserProvider} from "./context/UserContext.jsx";
import {SocketProvider} from "./context/SocketContext.jsx";
import VerifyEmail from "@/Pages/VerifyPage/VerifyEmail.jsx";

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<HomePage/>}/>
            <Route
              path="/authorization"
              element={<AuthPage/>}/>
            <Route
              path="/verify-email"
              element={<VerifyEmail/>}
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <ChatsPage/>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SocketProvider>
    </UserProvider>
  );
}

export default App;