"use client";

import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";
import { ArrowDown, Hash, Loader2, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageInput } from "@/features/chat/components/MessageInput";
import { MessageItem } from "@/features/chat/components/MessageItem";
import type { Message } from "@/features/chat/data";
import type { ChatMentionUser } from "@/services/api/client";
import type { PendingAttachment, ReplyingMessage, SelectedMention } from "../types/chat-page";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ChatMessagePaneProps = {
  loading: boolean;
  messages: Message[];
  groupedMessages: { label: string; messages: Message[] }[];
  isSearchMode: boolean;
  isSearching: boolean;
  searchResults: Message[];
  searchQuery: string;
  loadingMore: boolean;
  hasNewMessages: boolean;
  isMounted: boolean;
  currentUserId: string | null;
  currentUsername: string | null;
  message: string;
  editingMsgId: string | null;
  replyingMsg: ReplyingMessage;
  pendingAttachments: PendingAttachment[];
  mentionSuggestions: ChatMentionUser[];
  isUploading: boolean;
  uploadError: string | null;
  mentionQuery: string | null;
  mentionIndex: number;
  scrollViewportRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onSelectSearchResult: (message: Message) => Promise<void>;
  onReply: (message: Message) => void;
  onCopy: (content: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => Promise<any>;
  onOpenProfile: (userId: string) => void;
  onMention: (username: string) => void;
  onCopyLink: (messageId: string) => void;
  onMessageChange: (value: string) => void;
  onSend: () => Promise<void>;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCancelEdit: () => void;
  onCancelReply: () => void;
  onFileSelect: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
  onMentionSelect: (user: ChatMentionUser) => void;
  mentionedUsers: SelectedMention[];
  onRemoveMention: (userId: string) => void;
  setMentionIndex: Dispatch<SetStateAction<number>>;
  onScrollToBottom: () => void;
};

export function ChatMessagePane({
  loading,
  messages,
  groupedMessages,
  isSearchMode,
  isSearching,
  searchResults,
  searchQuery,
  loadingMore,
  hasNewMessages,
  isMounted,
  currentUserId,
  currentUsername,
  message,
  editingMsgId,
  replyingMsg,
  pendingAttachments,
  mentionSuggestions,
  isUploading,
  uploadError,
  mentionQuery,
  mentionedUsers,
  onRemoveMention,
  mentionIndex,
  scrollViewportRef,
  messagesEndRef,
  onSelectSearchResult,
  onReply,
  onCopy,
  onEdit,
  onDelete,
  onOpenProfile,
  onMention,
  onCopyLink,
  onMessageChange,
  onSend,
  onKeyDown,
  onCancelEdit,
  onCancelReply,
  onFileSelect,
  onRemoveAttachment,
  onMentionSelect,
  setMentionIndex,
  onScrollToBottom,
}: ChatMessagePaneProps) {
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (msgToDelete) {
      await onDelete(msgToDelete);
      setMsgToDelete(null);
    }
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <ScrollArea className="flex-1 p-4 pb-4" containerRef={scrollViewportRef}>
        <div className={loading || messages.length === 0 ? "min-h-full" : "flex min-h-full flex-col justify-end"}>
          <div className="space-y-1">
            {isSearchMode ? (
              isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="mb-2 h-10 w-10" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    <span>{searchResults.length} results for &quot;{searchQuery}&quot;</span>
                  </div>
                  {searchResults.map((chatMessage) => (
                    <button
                      key={`search-${chatMessage.id}`}
                      onClick={() => void onSelectSearchResult(chatMessage)}
                      className="w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-left hover:bg-muted/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{chatMessage.user.name}</span>
                        <span className="text-[11px] text-muted-foreground">{chatMessage.timestamp}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{chatMessage.content}</p>
                    </button>
                  ))}
                </div>
              )
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Hash className="mb-2 h-10 w-10" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs">Be first to say something!</p>
              </div>
            ) : (
              <>
                {loadingMore ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-xs text-muted-foreground">Loading older messages...</span>
                  </div>
                ) : null}
                {groupedMessages.map((group) => (
                  <div key={group.label}>
                    <div className="my-2 flex items-center gap-3">
                      <Separator className="flex-1" />
                      <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                        {isMounted ? group.label : "Loading..."}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                    <div className="space-y-1">
                      {group.messages.map((chatMessage) => (
                        <MessageItem
                          key={chatMessage.id}
                          msg={chatMessage}
                          currentUserId={currentUserId}
                          currentUsername={currentUsername}
                          onReply={onReply}
                          onCopy={onCopy}
                          onEdit={onEdit}
                          onDelete={(id) => setMsgToDelete(id)}
                          onOpenProfile={onOpenProfile}
                          onMention={onMention}
                          onCopyLink={onCopyLink}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div ref={messagesEndRef} className="h-px w-full" />
        </div>
      </ScrollArea>

      {hasNewMessages && !isSearchMode ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
          <Button type="button" onClick={onScrollToBottom} className="pointer-events-auto rounded-full shadow-lg">
            <ArrowDown className="mr-2 h-4 w-4" />
            New messages
          </Button>
        </div>
      ) : null}

      <MessageInput
        message={message}
        channelName="Global Chat"
        editingMessageId={editingMsgId}
        replyingMessage={replyingMsg}
        pendingAttachments={pendingAttachments}
        mentionSuggestions={mentionSuggestions}
        isUploading={isUploading}
        uploadError={uploadError}
        onChange={onMessageChange}
        onSend={() => void onSend()}
        onKeyDown={onKeyDown}
        onCancelEdit={onCancelEdit}
        onCancelReply={onCancelReply}
        onFileSelect={onFileSelect}
        onRemoveAttachment={onRemoveAttachment}
        onMentionSelect={onMentionSelect}
        mentionedUsers={mentionedUsers}
        onRemoveMention={onRemoveMention}
        mentionQuery={mentionQuery}
        mentionIndex={mentionIndex}
        setMentionIndex={setMentionIndex}
        isMounted={isMounted}
      />

      <AlertDialog open={!!msgToDelete} onOpenChange={(open) => !open && setMsgToDelete(null)}>
        <AlertDialogContent className="border-none bg-[#313338] text-[#dbdee1] overflow-hidden rounded-[16px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-[#b5bac1]">
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-[#2b2d31] -mx-6 -mb-6 p-4 mt-4">
            <AlertDialogCancel className="border-none bg-transparent text-white hover:underline hover:bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              className="bg-[#da373c] text-white hover:bg-[#a1282c] transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
