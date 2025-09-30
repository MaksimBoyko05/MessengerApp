import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AuthPage from "./Pages/AuthPage"

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/authorization">Authorization</Link>
        </nav>
        <Routes>
          <Route  path="authorization" element={<AuthPage/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
