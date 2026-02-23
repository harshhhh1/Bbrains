"use client"

import React, { useEffect, useRef } from 'react'
import { Message } from '../hooks/useChat'
import { ChatMessages } from './chat/chat-messages'
import { ChatEvent, ChatEventAddon, ChatEventBody, ChatEventTitle, ChatEventContent, ChatEventAvatar, ChatEventTime } from './chat/chat-event'

interface ChatMessageListProps {
    messages: Message[];
    currentUserUsername?: string;
}

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function formatDayMarker(date: Date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function ChatMessageList({ messages, currentUserUsername }: ChatMessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const renderedElements: React.ReactNode[] = [];
    let lastDate: Date | null = null;
    let lastUserUsername: string | null = null;
    let lastTime: number | null = null;

    messages.forEach((msg, idx) => {
        const msgDate = new Date(msg.timestamp);
        const msgTime = msgDate.getTime();

        let showDateMarker = false;
        if (!lastDate || !isSameDay(lastDate, msgDate)) {
            showDateMarker = true;
            lastDate = msgDate;
            renderedElements.push(
                <div key={`date-${msg.id}`} className="flex items-center justify-center my-6 gap-4">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/40">
                        {formatDayMarker(msgDate)}
                    </span>
                    <div className="flex-1 border-t border-border" />
                </div>
            )
        }

        // Show avatar if it's a new user, or if there was a date marker, or if more than 5 minutes have passed
        let showAvatarAndName = true;
        if (!showDateMarker && lastUserUsername === msg.user.username && lastTime && (msgTime - lastTime < 5 * 60 * 1000)) {
            showAvatarAndName = false;
        }

        const isOwn = msg.user.username === (currentUserUsername || 'User');
        // Add proper padding between messages: mt-4 if new thought/user, mt-1 if continuation
        const paddingClass = showAvatarAndName ? (idx === 0 || showDateMarker ? "mt-2" : "mt-6") : "mt-1";

        renderedElements.push(
            <ChatEvent key={msg.id} className={`${paddingClass} ${!showAvatarAndName ? "hover:bg-accent/30 group py-0.5 rounded-lg -mx-2 px-4 transition-colors" : ""}`}>
                <ChatEventAddon>
                    {showAvatarAndName ? (
                        <ChatEventAvatar
                            src={msg.user.avatar}
                            alt={msg.user.username}
                            fallback={msg.user.username?.slice(0, 2).toUpperCase() || 'U'}
                            className="shadow-sm border border-border/50"
                        />
                    ) : (
                        <ChatEventTime
                            timestamp={msgTime}
                            format="time"
                            className="text-[10px] text-muted-foreground/60 w-full text-center group-hover:opacity-100 opacity-0 transition-opacity mt-1 select-none"
                        />
                    )}
                </ChatEventAddon>
                <ChatEventBody>
                    {showAvatarAndName && (
                        <ChatEventTitle className="mb-0.5 mt-1">
                            <span className={`font-semibold text-[14px] ${isOwn ? 'text-primary' : 'text-foreground'}`}>
                                {isOwn ? 'You' : msg.user.username}
                            </span>
                            <ChatEventTime
                                timestamp={msgTime}
                                format="time"
                                className="text-[11px] text-muted-foreground/70"
                            />
                        </ChatEventTitle>
                    )}
                    <ChatEventContent className={showAvatarAndName ? "mt-0" : ""}>
                        <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {msg.text}
                        </div>
                    </ChatEventContent>
                </ChatEventBody>
            </ChatEvent>
        );

        lastUserUsername = msg.user.username || '';
        lastTime = msgTime;
    });

    return (
        <ChatMessages className="space-y-0 px-4 pb-4 flex-col">
            {messages.length === 0 && (
                <div className="m-auto text-muted-foreground text-sm italic p-4 flex items-center justify-center">
                    No messages yet. Say hello!
                </div>
            )}
            {renderedElements}
            <div ref={messagesEndRef} />
        </ChatMessages>
    )
}
