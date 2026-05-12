import {createContext, useEffect, useState} from 'react';
import axios from 'axios';

export const UserContext = createContext(null);

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {Authorization: `Bearer ${token}`},
        });
        setUser(res.data.user || res.data);
      } catch (error) {
        console.error("Сесія застаріла", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);
  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute("data-theme", user.theme);
    } else {
      document.documentElement.setAttribute("data-theme", "glass");
    }
  }, [user?.theme]);
  return (
    <UserContext.Provider value={{user, setUser, loading, checkAuth}}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContext;