import {createContext, useContext, useEffect, useState} from 'react';
import io from 'socket.io-client';
import {UserContext} from "./UserContext.jsx";

export const SocketContext = createContext(null);


export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket має використовуватись всередині SocketProvider");
  }
  return context;
};

export const SocketProvider = ({children}) => {
  const {user} = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000");
      newSocket.on("connect", () => {
        setSocket(newSocket);
        console.log("Сокет підключено:", newSocket.id);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{socket}}>
      {children}
    </SocketContext.Provider>
  );
}