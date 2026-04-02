import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketBaseUrl(): string {
  const override =
    typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined;
  if (override) return override.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8000`;
  }
  return "http://localhost:8000";
}

export function getSocket(): Socket {
  if (!socket) {
    const baseUrl = getSocketBaseUrl();
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
