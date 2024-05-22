"use client";

import React from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (message: string) => any;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket>();

  React.useEffect(() => {
    const _socket = io("http://localhost:8000");
    setSocket(_socket);

    return () => {
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  const sendMessage: ISocketContext["sendMessage"] = React.useCallback(
    (message: string) => {
      console.log("\nMsg that is about to be send is : ", message);
      if (socket) {
        socket.emit("event:message", { message });
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socketState = React.useContext(SocketContext);

  if (!socketState) throw new Error("Socket State is undefined.");

  return socketState;
};
