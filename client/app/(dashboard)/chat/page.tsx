"use client";

import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Components
import { ChannelHeader } from "@/features/chat/components/ChannelHeader";
import { MessageItem } from "@/features/chat/components/MessageItem";
import { MessageInput } from "@/features/chat/components/MessageInput";
import { ChatSidebarRight } from "@/features/chat/components/ChatSidebarRight";
import { ProfileDialog } from "@/features/chat/components/ProfileDialog";
import { Memberssidebar } from "@/features/chat/components/MembersSidebar";

import { useChatController } from "./hooks/useChatController";

export default function ChatPage() {
  const {
    messages,
    loading,
    isConnected,
    sendMessage,
    deleteMessage,
    editMessage,
    currentUserId,
    loadingMore,
    hasMore,
    searchMessages,
    searchResults,
    isSearching,
    isUploading,
    message,
    setMessage,
    showMembers,
    setShowMembers,
    isMounted,
    profileUser,
    setProfileUser,
    showProfile,
    setShowProfile,
    editingMsgId,
    setEditingMsgId,
    replyingMsg,
    setReplyingMsg,
    mentionQuery,
    setMentionQuery,
    mentionIndex,
    setMentionIndex,
    membersList,
    pendingAttachments,
    uploadError,
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    scrollRef,
    inputRef,
    filteredMentions,
    handleFileSelect,
    removeAttachment,
    handleSend,
    handleKeyDown,
    handleMentionSelect,
    handleUserClick,
  } = useChatController();

  if (!isMounted) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Main Chat Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChannelHeader
          isConnected={isConnected}
          onToggleMembers={() => setShowMembers(!showMembers)}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={searchMessages}
        />

        {isSearching && searchResults ? (
          <ScrollArea className="flex-1 px-4">
            <div className="py-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 px-2">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages found matching your search.</p>
              ) : (
                <div className="space-y-6">
                  {searchResults.map((msg) => (
                    <MessageItem
                      key={`search-${msg.id}`}
                      message={msg}
                      isCurrentUser={msg.userId === currentUserId}
                      onReply={() => setReplyingMsg({ id: msg.id, username: msg.user?.username || 'Unknown', content: msg.content })}
                      onEdit={() => {
                        setEditingMsgId(msg.id);
                        setMessage(msg.content);
                      }}
                      onDelete={() => deleteMessage(msg.id)}
                      onUserClick={handleUserClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!hasMore && messages.length > 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">This is the beginning of the chat history.</p>
                <Separator className="my-4 mx-auto max-w-[200px]" />
              </div>
            )}
            <div className="space-y-6 py-6">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground space-y-4 py-20">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p>No messages yet. Be the first to say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.userId === currentUserId}
                    onReply={() => setReplyingMsg({ id: msg.id, username: msg.user?.username || 'Unknown', content: msg.content })}
                    onEdit={() => {
                      setEditingMsgId(msg.id);
                      setMessage(msg.content);
                    }}
                    onDelete={() => deleteMessage(msg.id)}
                    onUserClick={handleUserClick}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <MessageInput
          message={message}
          setMessage={setMessage}
          isConnected={isConnected}
          editingMsgId={editingMsgId}
          setEditingMsgId={setEditingMsgId}
          replyingMsg={replyingMsg}
          setReplyingMsg={setReplyingMsg}
          handleSend={handleSend}
          handleKeyDown={handleKeyDown}
          inputRef={inputRef}
          mentionQuery={mentionQuery}
          setMentionQuery={setMentionQuery}
          mentionIndex={mentionIndex}
          setMentionIndex={setMentionIndex}
          filteredMentions={filteredMentions}
          handleMentionSelect={handleMentionSelect}
          isUploading={isUploading}
          pendingAttachments={pendingAttachments}
          handleFileSelect={handleFileSelect}
          removeAttachment={removeAttachment}
          uploadError={uploadError}
        />
      </div>

      {/* Right Sidebar - Members */}
      {showMembers && (
        <Memberssidebar membersList={membersList} onUserClick={handleUserClick} />
      )}

      {/* Profile Dialog */}
      <ProfileDialog 
        profileUser={profileUser}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
      />
    </div>
  );
}
