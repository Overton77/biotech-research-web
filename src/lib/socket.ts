import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const baseUrl =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : "http://localhost:8000";

export function getSocket(): Socket {
  if (!socket) {
    socket = io(baseUrl + "/research", {
      path: "/socket.io",
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
