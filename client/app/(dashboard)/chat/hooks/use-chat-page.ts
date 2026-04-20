"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";
import { useNotifications } from "@/components/providers/notification-provider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { chatApi, type ChatMemberProfile, type ChatMentionUser } from "@/services/api/client";
import { useChatMessages } from "@/features/chat/hooks/useChatMessages";
import { extractMentions, mapApiMember } from "@/features/chat/utils";
import type { Member, Message } from "@/features/chat/data";
import { groupMessagesByDate, MAX_ATTACHMENT_BYTES } from "../utils/chat-page";
import type { PendingAttachment, ReplyingMessage, SelectedMention } from "../types/chat-page";

export function useChatPage() {
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
  const [replyingMsg, setReplyingMsg] = useState<ReplyingMessage>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionSuggestions, setMentionSuggestions] = useState<ChatMentionUser[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<SelectedMention[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
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
    return currentUserProfile?.username ?? messages.find((item) => item.user.id === currentUserId)?.user.username ?? null;
  }, [currentUserId, currentUserProfile, messages]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await chatApi.getMembers();
        if (response.success && response.data) {
          const nextMembers = response.data.map((member: ChatMemberProfile) => mapApiMember(member));
          setMembersList(nextMembers);
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

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

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

    const timer = window.setTimeout(() => {
      setHasNewMessages(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [messages, scrollToBottom]);

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
    },
    [editingMsgId, handleSend, replyingMsg]
  );

  const handleMentionSelect = useCallback(
    (user: ChatMentionUser) => {
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
    },
    [message]
  );

  const handleOpenProfile = useCallback(
    (userId: string) => {
      const member = membersList.find((item) => item.id === userId);
      if (member) {
        setProfileUser(member);
        setShowProfile(true);
      }
    },
    [membersList]
  );

  const handleReply = useCallback((chatMessage: Message) => {
    setReplyingMsg({
      id: chatMessage.id,
      username: chatMessage.user.username,
      content: chatMessage.content,
    });
    setEditingMsgId(null);
  }, []);

  const handleEdit = useCallback(
    (id: string, content: string) => {
      setEditingMsgId(id);
      setMessage(content);
      detectMention(content);
      setReplyingMsg(null);
    },
    [detectMention]
  );

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }, []);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        setIsSearchMode(true);
        void searchMessages(query);
      } else {
        setIsSearchMode(false);
      }
    },
    [searchMessages]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchMode(false);
    setIsMobileSearchOpen(false);
  }, []);

  const handleOpenMobileSearch = useCallback(() => {
    setIsMobileSearchOpen((prev) => !prev);
  }, []);

  const handleSelectSearchResult = useCallback(
    async (chatMessage: Message) => {
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
    },
    [ensureMessageVisible]
  );

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
    const rafId = window.requestAnimationFrame(() => {
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      const isNearBottom = distanceFromBottom <= 100;
      shouldStickToBottomRef.current = isNearBottom;
      if (isNearBottom) {
        setHasNewMessages(false);
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      viewport.removeEventListener("scroll", handleScroll);
    };
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
  const onMembersSidebarOpenProfile = useCallback(
    (userId: string) => {
      handleOpenProfile(userId);
      setShowMembers(false);
    },
    [handleOpenProfile]
  );
  const handleMessageChange = useCallback(
    (value: string) => {
      setMessage(value);
      detectMention(value);
    },
    [detectMention]
  );

  return {
    state: {
      messages,
      loading,
      isConnected,
      currentUserId,
      isUploading,
      loadingMore,
      hasMore,
      searchResults,
      isSearching,
      message,
      membersPanelOpen,
      isMounted,
      profileUser,
      showProfile,
      editingMsgId,
      replyingMsg,
      mentionQuery,
      mentionIndex,
      mentionSuggestions,
      membersList,
      pendingAttachments,
      uploadError,
      searchQuery,
      isSearchMode,
      isMobileSearchOpen,
      hasNewMessages,
      currentUsername,
      groupedMessages,
    },
    refs: {
      messagesEndRef,
      scrollViewportRef,
      mobileSearchInputRef,
    },
    actions: {
      deleteMessage,
      setShowProfile,
      setMentionIndex,
      handleSearchChange,
      handleClearSearch,
      handleOpenMobileSearch,
      handleSelectSearchResult,
      handleReply,
      handleCopy,
      handleEdit,
      handleOpenProfile,
      handleMessageChange,
      handleSend,
      handleKeyDown,
      onEmojiSelect,
      onCancelEdit,
      onCancelReply,
      handleFileSelect,
      handleRemoveAttachment,
      handleMentionSelect,
      onToggleMembers,
      onMembersSidebarClose,
      onMembersSidebarOpenProfile,
      scrollToBottom,
    },
  };
}
