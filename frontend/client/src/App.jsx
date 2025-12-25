import {BrowserRouter as Router, Link, Route, Routes} from "react-router-dom";
import AuthPage from "./Pages/AuthPage/AuthPage.jsx";
import ChatsPage from "./Pages/ChatsPage/ChatsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {UserProvider} from "./context/UserContext.jsx";
import {SocketProvider} from "./context/SocketContext.jsx";

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <Router>
          <nav>
            <Link to="/authorization">Authorization</Link>
            <Link to="/chats">Chats</Link>
          </nav>
          <Routes>
            <Route
              path="/authorization"
              element={<AuthPage/>}/>
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