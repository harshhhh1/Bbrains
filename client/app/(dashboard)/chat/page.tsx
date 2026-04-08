"use client";

import { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Hash, Search, X, ArrowDown } from "lucide-react";
import { toast } from "sonner";

import { useChatMessages } from "@/features/chat/hooks/useChatMessages";
import { useNotifications } from "@/components/providers/notification-provider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { chatApi, type ChatMemberProfile, type ChatMentionUser } from "@/services/api/client";

import { ChannelHeader } from "@/features/chat/components/ChannelHeader";
import { MessageItem } from "@/features/chat/components/MessageItem";
import { MessageInput } from "@/features/chat/components/MessageInput";
import { ChatSidebarRight } from "@/features/chat/components/ChatSidebarRight";
import { ProfileDialog } from "@/features/chat/components/ProfileDialog";
import { Memberssidebar } from "@/features/chat/components/MembersSidebar";

import { Message, Member } from "@/features/chat/data";
import { extractMentions, mapApiMember } from "@/features/chat/utils";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

type SelectedMention = {
  id: string;
  username: string;
};

export default function ChatPage() {
  const {
    messages,
    loading,
    isConnected,
    sendMessage,
    deleteMessage,
    editMessage,
    currentUserId,
    currentUserProfile,
    chatRoomId,
    loadingMore,
    hasMore,
    loadMore,
    searchMessages,
    ensureMessageVisible,
    searchResults,
    isSearching,
    lastIncomingMessage,
  } = useChatMessages();

  const { markChannelRead, registerIncomingChatNotification } = useNotifications();
  const { uploadFile, isUploading } = useCloudinaryUpload();

  const [message, setMessage] = useState("");
  const [showMembers, setShowMembers] = useState<boolean | null>(null);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const membersPanelOpen = showMembers ?? (isMounted ? window.innerWidth >= 768 : false);
  const [profileUser, setProfileUser] = useState<Member | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<{ id: string; username: string; content: string } | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionSuggestions, setMentionSuggestions] = useState<ChatMentionUser[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<SelectedMention[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null!);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  const currentUsername = useMemo(() => {
    return currentUserProfile?.username ?? messages.find((m) => m.user.id === currentUserId)?.user.username ?? null;
  }, [currentUserId, currentUserProfile, messages]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await chatApi.getMembers();
        if (response.success && response.data) {
          const members = response.data.map((member: ChatMemberProfile) => mapApiMember(member));
          setMembersList(members);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Unable to load members list");
      }
    };

    void fetchMembers();
  }, []);

  useEffect(() => {
    if (!mentionQuery) {
      setMentionSuggestions([]);
      return;
    }

    let cancelled = false;

    const fetchMentionSuggestions = async () => {
      try {
        const response = await chatApi.searchUsers(mentionQuery, chatRoomId);
        if (!cancelled) {
          setMentionSuggestions(response.success && response.data ? response.data : []);
          setMentionIndex(0);
        }
      } catch {
        if (!cancelled) {
          setMentionSuggestions([]);
        }
      }
    };

    void fetchMentionSuggestions();

    return () => {
      cancelled = true;
    };
  }, [chatRoomId, mentionQuery]);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    const timer = window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isMobileSearchOpen]);

  useEffect(() => {
    if (!chatRoomId || messages.length === 0) return;
    void markChannelRead(chatRoomId);
  }, [chatRoomId, markChannelRead, messages.length]);

  useEffect(() => {
    if (!lastIncomingMessage) return;
    if (lastIncomingMessage.user.id === currentUserId) return;

    const mentionedCurrentUser = lastIncomingMessage.mentionedUserIds?.includes(currentUserId);
    if (mentionedCurrentUser && document.visibilityState !== "visible") {
      registerIncomingChatNotification(chatRoomId, "mention");
    }
  }, [chatRoomId, currentUserId, lastIncomingMessage, registerIncomingChatNotification]);

  const getDateLabel = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    const diff = today.getTime() - currentDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return currentDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  }, []);

  const groupedMessages = useMemo(() => {
    const groups: { label: string; messages: Message[] }[] = [];
    let currentLabel = "";
    messages.forEach((chatMessage) => {
      const label = getDateLabel(chatMessage.createdAt);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, messages: [chatMessage] });
      } else {
        groups[groups.length - 1].messages.push(chatMessage);
      }
    });
    return groups;
  }, [getDateLabel, messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    setHasNewMessages(false);
  }, []);

  const updateStickiness = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const isNearBottom = distanceFromBottom <= 100;
    shouldStickToBottomRef.current = isNearBottom;
    if (isNearBottom) {
      setHasNewMessages(false);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessageId = messages[messages.length - 1]?.id ?? null;
    const latestMessageChanged = latestMessageId !== lastMessageIdRef.current;
    lastMessageIdRef.current = latestMessageId;

    if (!latestMessageChanged) {
      return;
    }

    if (shouldStickToBottomRef.current || messages.length <= 1) {
      window.setTimeout(() => {
        scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
      }, 80);
      return;
    }

    setHasNewMessages(true);
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!message.trim() && pendingAttachments.length === 0) return;
    if (isUploading) return;

    try {
      const uploadedAttachments: { url: string; type: string; name?: string }[] = [];
      let failedUploads = 0;

      for (const attachment of pendingAttachments) {
        const url = await uploadFile(attachment.file, { folder: "chat attachments" });
        if (url) {
          uploadedAttachments.push({
            url,
            type: attachment.file.type,
            name: attachment.file.name,
          });
        } else {
          failedUploads += 1;
        }
      }

      if (failedUploads > 0) {
        const errorMsg = `${failedUploads} attachment${failedUploads > 1 ? "s" : ""} failed to upload. Please try again.`;
        setUploadError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const content = message.trim();
      const mentionIds = mentionedUsers.map((user) => user.id);
      const mentions = extractMentions(content);

      if (editingMsgId) {
        await editMessage(editingMsgId, content, mentions, mentionIds);
        setEditingMsgId(null);
      } else {
        await sendMessage(content, uploadedAttachments, mentions, replyingMsg?.id, mentionIds);
      }

      setMessage("");
      setMentionQuery(null);
      setMentionSuggestions([]);
      setMentionIndex(0);
      setMentionedUsers([]);
      setUploadError(null);
      setReplyingMsg(null);
      setPendingAttachments((prev) => {
        prev.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl));
        return [];
      });
      shouldStickToBottomRef.current = true;
      window.setTimeout(() => scrollToBottom("smooth"), 80);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    }
  }, [editMessage, editingMsgId, isUploading, mentionedUsers, message, pendingAttachments, replyingMsg, scrollToBottom, sendMessage, uploadFile]);

  const handleFileSelect = useCallback((files: File[]) => {
    const tooLarge = files.filter((file) => file.size > MAX_ATTACHMENT_BYTES);
    const validFiles = files.filter((file) => file.size <= MAX_ATTACHMENT_BYTES);

    if (tooLarge.length > 0) {
      const tooLargeNames = tooLarge.map((file) => file.name).join(", ");
      const errorMsg = `File must be 10MB or smaller. Remove and re-upload: ${tooLargeNames}`;
      setUploadError(errorMsg);
      toast.error(errorMsg);
    } else {
      setUploadError(null);
    }

    if (validFiles.length === 0) return;

    const newPending = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingAttachments((prev) => [...prev, ...newPending]);
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setPendingAttachments((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
    setUploadError(null);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }

    if (event.key === "Escape") {
      if (editingMsgId) {
        setEditingMsgId(null);
        setMessage("");
      }
      if (replyingMsg) setReplyingMsg(null);
      setMentionQuery(null);
      setMentionSuggestions([]);
    }
  }, [editingMsgId, handleSend, replyingMsg]);

  const detectMention = useCallback((value: string) => {
    const active = document.activeElement as HTMLInputElement | null;
    const cursorPos = active && typeof active.selectionStart === "number" ? active.selectionStart : value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
      setMentionSuggestions([]);
    }

    const activeMentions = extractMentions(value).map((entry) => entry.toLowerCase());
    setMentionedUsers((prev) => prev.filter((user) => activeMentions.includes(user.username.toLowerCase())));
  }, []);

  const handleMentionSelect = useCallback((user: ChatMentionUser) => {
    const input = document.querySelector('input[aria-label="Message input"]') as HTMLInputElement | null;
    const cursorPos = input?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorPos);
    const textAfterCursor = message.slice(cursorPos);
    const beforeMention = textBeforeCursor.replace(/@(\w*)$/, "");
    const nextMessage = `${beforeMention}@${user.username} ${textAfterCursor}`;

    setMessage(nextMessage);
    setMentionQuery(null);
    setMentionSuggestions([]);
    setMentionedUsers((prev) => {
      const filtered = prev.filter((entry) => entry.id !== user.id);
      return [...filtered, { id: user.id, username: user.username }];
    });

    window.setTimeout(() => {
      const newPos = beforeMention.length + user.username.length + 2;
      input?.focus();
      input?.setSelectionRange(newPos, newPos);
    }, 0);
  }, [message]);

  const handleOpenProfile = useCallback((userId: string) => {
    const member = membersList.find((item) => item.id === userId);
    if (member) {
      setProfileUser(member);
      setShowProfile(true);
    }
  }, [membersList]);

  const handleReply = useCallback((chatMessage: Message) => {
    setReplyingMsg({
      id: chatMessage.id,
      username: chatMessage.user.username,
      content: chatMessage.content,
    });
    setEditingMsgId(null);
  }, []);

  const handleEdit = useCallback((id: string, content: string) => {
    setEditingMsgId(id);
    setMessage(content);
    detectMention(content);
    setReplyingMsg(null);
  }, [detectMention]);

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearchMode(true);
      void searchMessages(query);
    } else {
      setIsSearchMode(false);
    }
  }, [searchMessages]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchMode(false);
    setIsMobileSearchOpen(false);
  }, []);

  const handleOpenMobileSearch = useCallback(() => {
    setIsMobileSearchOpen((prev) => !prev);
  }, []);

  const handleSelectSearchResult = useCallback(async (chatMessage: Message) => {
    const loaded = await ensureMessageVisible(chatMessage.id, chatMessage.createdAt);
    if (!loaded) {
      toast.error("Unable to locate that message in the current history");
      return;
    }

    setIsSearchMode(false);
    setIsMobileSearchOpen(false);

    window.setTimeout(() => {
      const target = document.getElementById(`msg-${chatMessage.id}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  }, [ensureMessageVisible]);

  const handleScroll = useCallback(() => {
    updateStickiness();

    if (scrollViewportRef.current && hasMore && !loadingMore && !isSearchMode) {
      if (scrollViewportRef.current.scrollTop === 0) {
        void loadMore();
      }
    }
  }, [hasMore, isSearchMode, loadMore, loadingMore, updateStickiness]);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    viewport.addEventListener("scroll", handleScroll);
    updateStickiness();

    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [handleScroll, updateStickiness]);

  const onEmojiSelect = useCallback((emoji: { emoji: string }) => setMessage((prev) => prev + emoji.emoji), []);
  const onCancelEdit = useCallback(() => {
    setEditingMsgId(null);
    setMessage("");
    setMentionedUsers([]);
  }, []);
  const onCancelReply = useCallback(() => setReplyingMsg(null), []);
  const onToggleMembers = useCallback(() => {
    setShowMembers((current) => !(current ?? (window.innerWidth >= 768)));
  }, []);

  const onMembersSidebarClose = useCallback(() => setShowMembers(false), []);
  const onMembersSidebarOpenProfile = useCallback((userId: string) => {
    handleOpenProfile(userId);
    setShowMembers(false);
  }, [handleOpenProfile]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card md:rounded-xl md:border md:shadow-sm">
      <ChannelHeader
        channelName="Global Chat"
        showMembers={membersPanelOpen}
        messageCount={messages.length}
        isConnected={isConnected}
        onToggleMembers={onToggleMembers}
        onSearch={handleSearchChange}
        onClearSearch={handleClearSearch}
        searchQuery={searchQuery}
        onOpenSearch={handleOpenMobileSearch}
      />

      {isMobileSearchOpen && (
        <div className="border-b border-border bg-card px-3 py-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={mobileSearchInputRef}
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search this chat..."
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
            {searchQuery.trim() ? (
              isSearching ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No messages found.</div>
              ) : (
                searchResults.map((chatMessage) => (
                  <button
                    key={`mobile-search-${chatMessage.id}`}
                    onClick={() => void handleSelectSearchResult(chatMessage)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{chatMessage.user.name}</span>
                      <span className="text-[11px] text-muted-foreground">{chatMessage.timestamp}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{chatMessage.content}</p>
                  </button>
                ))
              )
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">Type to search messages in this channel.</div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 relative">
          <ScrollArea className="flex-1 p-4 pb-4" containerRef={scrollViewportRef}>
            <div className={loading || messages.length === 0 ? "min-h-full" : "min-h-full flex flex-col justify-end"}>
              <div className="space-y-1">
                {isSearchMode ? (
                  isSearching ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground text-sm">Searching...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Search className="w-10 h-10 mb-2" />
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Search className="w-4 h-4" />
                        <span>{searchResults.length} results for &quot;{searchQuery}&quot;</span>
                      </div>
                      {searchResults.map((chatMessage) => (
                        <button
                          key={`search-${chatMessage.id}`}
                          onClick={() => void handleSelectSearchResult(chatMessage)}
                          className="w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-left hover:bg-muted/40"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">{chatMessage.user.name}</span>
                            <span className="text-[11px] text-muted-foreground">{chatMessage.timestamp}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{chatMessage.content}</p>
                        </button>
                      ))}
                    </div>
                  )
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground text-sm">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Hash className="w-10 h-10 mb-2" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs">Be the first to say something!</p>
                  </div>
                ) : (
                  <>
                    {loadingMore && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground text-xs">Loading older messages...</span>
                      </div>
                    )}
                    {groupedMessages.map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-3 my-2">
                          <Separator className="flex-1" />
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
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
                              onReply={handleReply}
                              onCopy={handleCopy}
                              onEdit={handleEdit}
                              onDelete={deleteMessage}
                              onOpenProfile={handleOpenProfile}
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

          {hasNewMessages && !isSearchMode && (
            <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
              <Button
                type="button"
                onClick={() => scrollToBottom("smooth")}
                className="pointer-events-auto rounded-full shadow-lg"
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                New messages
              </Button>
            </div>
          )}

          <MessageInput
            message={message}
            channelName="Global Chat"
            editingMessageId={editingMsgId}
            replyingMessage={replyingMsg}
            pendingAttachments={pendingAttachments}
            mentionSuggestions={mentionSuggestions}
            isUploading={isUploading}
            uploadError={uploadError}
            onChange={(value) => {
              setMessage(value);
              detectMention(value);
            }}
            onSend={() => void handleSend()}
            onKeyDown={handleKeyDown}
            onEmojiSelect={onEmojiSelect}
            onCancelEdit={onCancelEdit}
            onCancelReply={onCancelReply}
            onFileSelect={handleFileSelect}
            onRemoveAttachment={handleRemoveAttachment}
            onMentionSelect={handleMentionSelect}
            mentionQuery={mentionQuery}
            mentionIndex={mentionIndex}
            setMentionIndex={setMentionIndex}
          />
        </div>

        {isMounted && membersPanelOpen && (
          <>
            <ChatSidebarRight
              members={membersList}
              currentUserId={currentUserId || ""}
              onSelectUser={(user) => handleOpenProfile(user.id)}
            />

            <div className="md:hidden">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-90 animate-in fade-in duration-300"
                onClick={onMembersSidebarClose}
              />
              <Memberssidebar
                members={membersList}
                currentUserId={currentUserId || ""}
                onClose={onMembersSidebarClose}
                onOpenProfile={onMembersSidebarOpenProfile}
              />
            </div>
          </>
        )}
      </div>

      <ProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        member={profileUser}
      />
    </div>
  );
}
