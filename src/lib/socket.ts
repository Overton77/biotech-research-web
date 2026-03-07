import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const baseUrl =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined) || "http://localhost:8000";

export function getSocket(): Socket {
  if (!socket) {
    socket = io(baseUrl + "/research", {
      path: "/socket.io",
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
