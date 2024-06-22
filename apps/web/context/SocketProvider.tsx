"use client";

import React from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (
    message: string,
    setMessage: React.Dispatch<React.SetStateAction<string>>
  ) => any;
  messages: string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket>();
  const [messages, setMessages] = React.useState<string[]>([]);

  const messageRecieved = React.useCallback((msg: string) => {
    console.log("\nMsg from Server to Client is : ", msg);
    const { message } = JSON.parse(msg) as { message: string };
    setMessages((prevState) => [...prevState, message]);
  }, []);

  React.useEffect(() => {
    const _socket = io("http://localhost:8000");
    setSocket(_socket);

    _socket.on("srv:message", messageRecieved);

    return () => {
      _socket.disconnect();
      _socket.off("srv:message", messageRecieved);
      setSocket(undefined);
    };
  }, []);

  const sendMessage: ISocketContext["sendMessage"] = React.useCallback(
    (
      message: string,
      setMessage: React.Dispatch<React.SetStateAction<string>>
    ) => {
      console.log("\nMsg from Client to Server is : ", message);
      if (socket) {
        socket.emit("client:message", { message });
        setMessage("");
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socketState = React.useContext(SocketContext);

  if (!socketState) throw new Error("Socket State is undefined.");

  return socketState;
};
