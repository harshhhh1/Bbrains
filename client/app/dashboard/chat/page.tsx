"use client"

import React from 'react'
import { Send, Users } from 'lucide-react'

// Import chat hooks & components
import { useChat } from './hooks/useChat'
import { ChatMessageList } from './components/message-list'
import { MemberSidebar } from './components/member-sidebar'

// Import UI wrappers
import { Chat } from './components/chat/chat'
import { ChatHeader, ChatHeaderMain, ChatHeaderAddon } from './components/chat/chat-header'
import { ChatToolbarAddon, ChatToolbarButton } from './components/chat/chat-toolbar'

export default function ChatPage() {
    const {
        user,
        messages,
        inputText,
        setInputText,
        activeUsers,
        sendMessage
    } = useChat()

    return (
        <div className="flex h-full flex-1 overflow-hidden w-full bg-background">
            {/* Main Chat Area */}
            <div className="flex-1 min-w-0 h-full flex flex-col relative w-full">
                <Chat className="h-full flex flex-col bg-background z-10 w-full relative">
                    {/* Chat Header */}
                    <ChatHeader className="h-[60px] border-b border-border bg-background/95 backdrop-blur z-20 sticky top-0 px-6 flex items-center shrink-0 shadow-sm transition-all hover:bg-background">
                        <ChatHeaderMain className="gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Users size={20} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <h1 className="text-lg font-bold text-foreground leading-tight tracking-tight truncate">Global Chat</h1>
                                <span className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse relative">
                                        <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
                                    </span>
                                    {activeUsers.length} Online
                                </span>
                            </div>
                        </ChatHeaderMain>
                        <ChatHeaderAddon>
                            {/* Potential actions to be placed here */}
                        </ChatHeaderAddon>
                    </ChatHeader>

                    {/* Messages Container */}
                    <ChatMessageList
                        messages={messages}
                        currentUserUsername={user?.username}
                    />

                    {/* Message Input Container */}
                    <div className="shrink-0 px-4 py-4 bg-background z-20 sticky bottom-0">
                        <div className="flex flex-wrap items-end gap-x-2 bg-background border border-border/60 rounded-xl relative focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
                            <ChatToolbarAddon align="inline-start" className="pb-1.5 px-1" />
                            <div className="flex-1 min-w-0 order-2 grid py-1.5">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="h-fit min-h-9 max-h-32 px-1 py-1.5 border-none shadow-none focus-visible:border-none focus-visible:ring-0 placeholder:whitespace-nowrap resize-none bg-transparent w-full text-[15px] focus-visible:outline-none scrollbar-w-1 scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 leading-relaxed placeholder:text-muted-foreground/50"
                                    rows={1}
                                    style={{
                                        fieldSizing: 'content'
                                    } as any}
                                />
                            </div>
                            <ChatToolbarAddon align="inline-end" className="pb-1.5 pr-1.5">
                                <ChatToolbarButton
                                    onClick={sendMessage}
                                    disabled={!inputText.trim()}
                                    className={`rounded-lg transition-all active:scale-95 h-9 w-9 p-0 flex items-center justify-center ${inputText.trim()
                                        ? 'bg-primary text-primary-foreground shadow-sm hover:shadow hover:bg-primary/95'
                                        : 'bg-transparent text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Send size={18} className={inputText.trim() ? "translate-x-0.5" : ""} />
                                </ChatToolbarButton>
                            </ChatToolbarAddon>
                        </div>
                    </div>
                </Chat>
            </div>

            {/* Right Sidebar - Members List */}
            <MemberSidebar activeUsers={activeUsers} />
        </div>
    )
}
