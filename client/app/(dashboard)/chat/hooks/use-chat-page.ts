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
import { supabase } from "@/services/supabase/client";

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
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

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
    return () => {
      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    }
  }, []);

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

  useEffect(() => {
    if (!currentUserId || !isConnected) return;

    const channel = supabase.channel("chat_presence");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, { user_id?: string }[]>;
        const onlineIds = new Set<string>();
        for (const key in state) {
          state[key].forEach((presence) => {
            if (presence.user_id) onlineIds.add(presence.user_id);
          });
        }
        setOnlineUserIds(onlineIds);
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, isConnected]);

  const membersWithStatus = useMemo(() => {
    return membersList.map((m) => ({
      ...m,
      status: (onlineUserIds.has(m.id) ? "online" : "offline") as "online" | "offline" | "idle",
    }));
  }, [membersList, onlineUserIds]);

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
      const autoMentions = extractMentions(content);
      const verifiedAutoMentions = autoMentions.filter(uname => 
        membersList.some(m => m.username.toLowerCase() === uname.toLowerCase())
      );
      
      const mentionIds = mentionedUsers.map((user) => user.id);
      const mentions = Array.from(new Set([
        ...mentionedUsers.map((user) => user.username),
        ...verifiedAutoMentions
      ]));

      if (editingMsgId) {
        await editMessage(editingMsgId, content, mentions, mentionIds);
        setEditingMsgId(null);
      } else {
        await sendMessage(
          content,
          uploadedAttachments,
          mentions,
          replyingMsg?.id,
          mentionIds,
          replyingMsg ? { username: replyingMsg.username, content: replyingMsg.content } : undefined
        );
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

  const handleRemoveMention = useCallback((userId: string) => {
    setMentionedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleOpenProfile = useCallback(
    (userId: string) => {
      const member = membersWithStatus.find((item) => item.id === userId);
      if (member) {
        setProfileUser(member);
        setShowProfile(true);
      }
    },
    [membersWithStatus]
  );

  const handleReply = useCallback((chatMessage: Message) => {
    setReplyingMsg({
      id: chatMessage.id,
      username: chatMessage.user.username,
      name: chatMessage.user.name,
      avatar: chatMessage.user.avatar,
      content: chatMessage.content,
    });
    setEditingMsgId(null);
  }, []);

  const handleEdit = useCallback(
    (chatMessage: Message) => {
      setEditingMsgId(chatMessage.id);
      setMessage(chatMessage.content);

      // Restore mentions for the editing state
      const initialMentions: SelectedMention[] = [];
      const mentionNames = chatMessage.mentions || [];
      const mentionIds = chatMessage.mentionedUserIds || [];

      for (let i = 0; i < mentionIds.length; i++) {
        if (mentionIds[i] && mentionNames[i]) {
          initialMentions.push({
            id: mentionIds[i],
            username: mentionNames[i],
          });
        }
      }
      setMentionedUsers(initialMentions);

      detectMention(chatMessage.content);
      setReplyingMsg(null);
    },
    [detectMention]
  );

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }, []);

  const handleCopyLink = useCallback((messageId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?msgId=${messageId}`;
    navigator.clipboard.writeText(url);
    toast.success("Message link copied!");
  }, []);

  const handleMention = useCallback((username: string) => {
    setMessage((prev) => `@${username} ${prev}`);
    // Focus the input after adding mention
    window.setTimeout(() => {
      const input = document.querySelector('input[aria-label="Message input"]') as HTMLInputElement | null;
      input?.focus();
    }, 0);
  }, []);

  const searchTimeoutRef = useRef<number>(null);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }

      if (query.trim()) {
        setIsSearchMode(true);
        searchTimeoutRef.current = window.setTimeout(() => {
          void searchMessages(query);
        }, 300);
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
      pendingAttachments,
      uploadError,
      searchQuery,
      isSearchMode,
      isMobileSearchOpen,
      hasNewMessages,
      currentUsername,
      groupedMessages,
      onlineUserIds,
      mentionedUsers,
      mentionQuery,
      membersList: membersWithStatus,
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
      handleCopyLink,
      handleMention,
      handleEdit,
      handleOpenProfile,
      handleMessageChange,
      handleSend,
      handleKeyDown,
      onCancelEdit,
      onCancelReply,
      handleFileSelect,
      handleRemoveAttachment,
      handleMentionSelect,
      handleRemoveMention,
      onToggleMembers,
      onMembersSidebarClose,
      onMembersSidebarOpenProfile,
      scrollToBottom,
    },
  };
}
