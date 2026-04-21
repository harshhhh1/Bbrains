"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useChatMessages } from "@/features/chat/hooks/useChatMessages";
import { useNotifications } from "@/components/providers/notification-provider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useChatMembers } from "@/features/chat/hooks/useChatMembers";
import { useChatScroll } from "@/features/chat/hooks/useChatScroll";
import { ChatSidebarRight } from "./ChatSidebarRight";
import { ChatThreadList } from "./ChatThreadList";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatDialogs } from "./ChatDialogs";
import type { Member } from "@/features/chat/data";

export default function ChatView() {
  const { 
    messages, loading, loadingMore, hasMore, loadMore, isConnected, 
    sendMessage, deleteMessage, editMessage, currentUserId, ensureMessageVisible 
  } = useChatMessages();
  
  const { markAllRead } = useNotifications();
  const { uploadFile, isUploading } = useCloudinaryUpload();
  const { membersList, currentUsername } = useChatMembers(currentUserId);
  
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const [profileUser, setProfileUser] = useState<Member | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<{ id: string; username: string; content: string } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const [highlightedMsg, setHighlightedMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // Scroll Management
  const { scrollAreaRef, messagesEndRef, handleScroll } = useChatScroll({
    messagesCount: messages.length,
    hasMore,
    loadingMore,
    loading,
    loadMore
  });

  // Deep Link Handling
  useEffect(() => {
    const msgId = searchParams.get("msgId");
    if (!msgId || loading) return;

    const scrollToMsg = async () => {
      const success = await ensureMessageVisible(msgId);
      if (success) {
        setTimeout(() => {
          const el = document.getElementById(`msg-${msgId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedMsg(msgId);
            setTimeout(() => setHighlightedMsg(null), 2000);
          }
        }, 300);
      }
    };

    scrollToMsg();
  }, [searchParams, loading, ensureMessageVisible]);

  // Mark all read when messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAllRead?.();
    }
  }, [messages.length, markAllRead]);

  // Handlers
  const handleSend = async () => {
    if (!message.trim() && pendingAttachments.length === 0) return;
    if (isUploading) return;

    const uploadedAttachments: { url: string; type: string; name?: string }[] = [];
    for (const att of pendingAttachments) {
      const url = await uploadFile(att.file);
      if (url) {
        uploadedAttachments.push({ url, type: att.file.type, name: att.file.name });
      }
    }

    const content = message.trim();
    const mentions = (content.match(/@(\w+)/g) || []).map(m => m.slice(1));
    
    await sendMessage(
      content, 
      uploadedAttachments, 
      mentions, 
      replyingMsg?.id || undefined, 
      [], 
      replyingMsg ? { username: replyingMsg.username, content: replyingMsg.content } : undefined
    );
    
    setMessage("");
    setReplyingMsg(null);
    setPendingAttachments([]);
    inputRef.current?.focus();
  };

  const handleEditSave = async () => {
    if (!editingMsg || !editContent.trim()) return;
    const mentions = (editContent.match(/@(\w+)/g) || []).map(m => m.slice(1));
    await editMessage(editingMsg, editContent.trim(), mentions);
    setEditingMsg(null);
    setEditContent("");
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?msgId=${id}`;
    navigator.clipboard.writeText(url);
  };

  const filteredMessages = searchQuery 
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const grouped = filteredMessages.reduce((acc: any[], msg) => {
    const date = new Date(msg.createdAt);
    const label = date.toDateString() === new Date().toDateString() ? "Today" : 
                  date.toDateString() === new Date(Date.now() - 86400000).toDateString() ? "Yesterday" :
                  date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    
    if (acc.length > 0 && acc[acc.length - 1].label === label) {
      acc[acc.length - 1].messages.push(msg);
    } else {
      acc.push({ label, messages: [msg] });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ChatHeader
        title="Global Chat"
        messageCount={messages.length}
        isConnected={isConnected}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMembers={showMembers}
        setShowMembers={setShowMembers}
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-background/50">
          <ScrollArea className="flex-1 px-1" ref={scrollAreaRef} onScrollCapture={handleScroll}>
            <div className="py-4">
              {loading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-muted-foreground text-sm font-medium">Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Loader2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No messages yet</p>
                  <p className="text-xs">Start the conversation by saying hello!</p>
                </div>
              ) : (
                <>
                  {loadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                  <ChatThreadList
                    grouped={grouped}
                    currentUserId={currentUserId}
                    currentUsername={currentUsername || null}
                    highlightedMsgId={highlightedMsg}
                    editingMsgId={editingMsg}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    onEditSave={handleEditSave}
                    onCancelEdit={() => { setEditingMsg(null); setEditContent(""); }}
                    onReply={setReplyingMsg}
                    onDelete={setDeleteMsg}
                    onMention={(username) => {
                      setMessage((prev) => `@${username} ${prev}`);
                      inputRef.current?.focus();
                    }}
                    onProfileOpen={setProfileUser}
                    onCopy={(content) => navigator.clipboard.writeText(content)}
                    onCopyLink={handleCopyLink}
                    onEditStart={(id, content) => { setEditingMsg(id); setEditContent(content); }}
                  />
                </>
              )}
            </div>
            <div ref={messagesEndRef} className="h-4 w-full" />
          </ScrollArea>

          <ChatInput
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            isUploading={isUploading}
            replyingMsg={replyingMsg}
            setReplyingMsg={setReplyingMsg}
            pendingAttachments={pendingAttachments}
            setPendingAttachments={setPendingAttachments}
            inputRef={inputRef}
          />
        </div>

        {showMembers && (
          <ChatSidebarRight 
            members={membersList} 
            currentUserId={currentUserId} 
            onSelectUser={setProfileUser} 
          />
        )}
      </div>

      <ChatDialogs
        profileUser={profileUser}
        setProfileUser={setProfileUser}
        deleteMsgId={deleteMsg}
        setDeleteMsgId={setDeleteMsg}
        onDeleteConfirm={async () => {
          if (deleteMsg) {
            await deleteMessage(deleteMsg);
            setDeleteMsg(null);
          }
        }}
      />
    </div>
  );
}
