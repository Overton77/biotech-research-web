"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    const dev = process.env.NODE_ENV === "development";
    const onConnect = () => {
      if (dev) console.info("[socket] connected", { id: socket.id });
    };
    const onDisconnect = (reason: string) => {
      if (dev) console.warn("[socket] disconnected", { reason });
    };
    const onConnectError = (err: Error) => {
      console.error("[socket] connect_error", err.message);
    };
    if (dev) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
    }
    socket.on("connect_error", onConnectError);
    socket.connect();
    return () => {
      if (dev) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      }
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("useSocket must be used within SocketProvider");
  return socket;
}
