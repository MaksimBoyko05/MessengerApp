import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import AuthPage from "./Pages/AuthPage/AuthPage.jsx";
import ChatsPage from "./Pages/ChatsPage/ChatsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {UserProvider} from "./context/UserContext.jsx";
import {SocketProvider} from "./context/SocketContext.jsx";
import VerifyEmail from "@/Pages/VerifyPage/VerifyEmail.jsx";
import ResetPassword from "@/Pages/VerifyPage/ResetPassword.jsx";
import "@/assets/styles/_themes.scss";
import {ToastContainer} from "react-toastify";
import NotFound from "@/Pages/NotFound/NotFound.jsx";

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
              path="*"
              element={<NotFound/>}/>
            <Route
              path="/authorization"
              element={<AuthPage/>}/>
            <Route
              path="/verify-email"
              element={<VerifyEmail/>}
            />
            <Route
              path={"/reset-password"}
              element={<ResetPassword/>}
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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </SocketProvider>
    </UserProvider>
  );
}

export default App;