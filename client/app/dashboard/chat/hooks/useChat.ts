"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/AuthProvider'

export interface MessageUserInfo {
    username?: string;
    avatar?: string;
}

export interface Message {
    id: string;
    text: string;
    user: MessageUserInfo;
    timestamp: string;
}

export interface ActiveUser {
    socketId: string;
    username: string;
    type: string;
    avatar?: string;
}

export function useChat() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef<Socket | null>(null)

    // Setup socket connection
    useEffect(() => {
        if (!user) return;

        // Note: adjust the URL based on where your backend runs. By default AuthProvider uses http://localhost:5000
        const newSocket = io("http://localhost:5000", {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socketRef.current = newSocket;

        const userData = {
            id: user.id || user.userId,
            username: user.username || 'User',
            type: user.type || 'student',
            avatar: user.userDetails?.avatar || user.avatarUrl || user.avatar || null,
        }

        newSocket.on("connect", () => {
            setIsConnected(true);
            newSocket.emit("join", userData);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error: any) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
        });

        newSocket.on("receive_message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        newSocket.on("active_users", (users: ActiveUser[]) => {
            setActiveUsers(users);
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
                socketRef.current = null;
            }
        }
    }, [user])

    const sendMessage = useCallback(() => {
        if (!inputText.trim() || !socketRef.current || !user || !isConnected) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            user: {
                username: user.username || 'User',
                avatar: user.userDetails?.avatar || user.avatarUrl || user.avatar || null,
            },
            timestamp: new Date().toISOString()
        }

        socketRef.current.emit("send_message", newMessage)
        setInputText('')
    }, [inputText, user, isConnected]);

    return {
        user,
        messages,
        inputText,
        setInputText,
        activeUsers,
        isConnected,
        sendMessage,
    }
}
