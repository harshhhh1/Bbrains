import { io, Socket } from "socket.io-client";
import { getAuthToken, getBaseUrl } from "@/services/api/client";

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
    if (socket) return socket;

    const token = await getAuthToken();
    const baseUrl = getBaseUrl();

    const socketUrl = baseUrl;

    socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("Socket.io connected");
    });

    socket.on("connect_error", (err) => {
        console.error("Socket.io connection error:", err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
