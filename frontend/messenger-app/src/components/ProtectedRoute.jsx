import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/authorization" />;
  }

  return children;
}

export default ProtectedRoute;
