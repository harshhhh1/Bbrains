import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useChatMessages } from "@/features/chat/hooks/useChatMessages";
import { useNotifications } from "@/components/providers/notification-provider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { chatApi, type ChatMemberProfile } from "@/services/api/client";
import { Message, Member } from "@/features/chat/data";
import { extractMentions, mapApiMember } from "@/features/chat/utils";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export function useChatController() {
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
    loadMore,
    searchMessages,
    searchResults,
    isSearching
  } = useChatMessages();

  const { markAllRead } = useNotifications();
  const { uploadFile, isUploading } = useCloudinaryUpload();

  const [message, setMessage] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [profileUser, setProfileUser] = useState<Member | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<{ id: string; username: string; content: string } | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setShowMembers(true);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const res = await chatApi.getChatMembers();
      if (res.success && res.data) {
        const sortedMembers = (res.data as ChatMemberProfile[]).sort((a, b) => {
          if (a.isOnline === b.isOnline) return a.username.localeCompare(b.username);
          return a.isOnline ? -1 : 1;
        });

        const mapped = sortedMembers.map(mapApiMember);
        setMembersList(mapped);
      }
    } catch (error) {
      console.error("Failed to load chat members:", error);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    const intervalId = setInterval(loadMembers, 30000);
    return () => clearInterval(intervalId);
  }, [loadMembers]);

  useEffect(() => {
    const timer = setTimeout(() => markAllRead("chat"), 1000);
    return () => clearTimeout(timer);
  }, [markAllRead, messages]);

  const filteredMentions = useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.toLowerCase();
    return membersList
      .filter((m) => m.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [mentionQuery, membersList]);

  useEffect(() => {
    const atMatch = message.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }, [message]);

  useEffect(() => {
    if (scrollRef.current && !loadingMore && !isSearching) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, loadingMore, isSearching]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError(null);

    if (pendingAttachments.length + files.length > 5) {
      setUploadError("Maximum 5 attachments allowed.");
      toast.error("Maximum 5 attachments allowed.");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    const newAttachments = validFiles.map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    }));

    setPendingAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => {
      const updated = [...prev];
      if (updated[index].previewUrl) {
        URL.revokeObjectURL(updated[index].previewUrl);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && pendingAttachments.length === 0) return;

    try {
      let finalMessage = trimmedMessage;

      if (pendingAttachments.length > 0) {
        const uploadPromises = pendingAttachments.map(att => uploadFile(att.file));
        const urls = await Promise.all(uploadPromises);

        const markdownAttachments = pendingAttachments.map((att, i) => {
          if (att.file.type.startsWith('image/')) {
            return `![${att.file.name}](${urls[i]})`;
          } else {
            return `[📎 ${att.file.name}](${urls[i]})`;
          }
        }).join('\n');

        finalMessage = finalMessage ? `${finalMessage}\n\n${markdownAttachments}` : markdownAttachments;
      }

      if (editingMsgId) {
        await editMessage(editingMsgId, finalMessage);
        setEditingMsgId(null);
      } else {
        const mentions = extractMentions(finalMessage);
        await sendMessage(
          finalMessage,
          replyingMsg?.id,
          mentions.length > 0 ? mentions : undefined
        );
      }

      setMessage("");
      setReplyingMsg(null);

      pendingAttachments.forEach(att => {
        if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
      });
      setPendingAttachments([]);
      setUploadError(null);

      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Failed to send message with attachments:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % filteredMentions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleMentionSelect(filteredMentions[mentionIndex].name);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMentionSelect = (username: string) => {
    const beforeMention = message.substring(0, message.lastIndexOf("@"));
    setMessage(`${beforeMention}@${username} `);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const handleUserClick = (userId: string) => {
    const member = membersList.find((m) => m.id === userId);
    if (member) {
      setProfileUser(member);
      setShowProfile(true);
    } else {
      setProfileUser({
        id: userId,
        name: "Unknown User",
        handle: `@unknown`,
        role: "student",
        avatar: "/avatars/unknown.jpg",
        status: "offline",
        isOnline: false,
        bio: "User information not available.",
      });
      setShowProfile(true);
    }
  };

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const handleScroll = () => {
      if (viewport.scrollTop < 100 && hasMore && !loadingMore && !isSearching) {
        loadMore();
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loadMore, isSearching]);

  return {
    messages,
    loading,
    isConnected,
    sendMessage,
    deleteMessage,
    editMessage,
    currentUserId,
    loadingMore,
    hasMore,
    loadMore,
    searchMessages,
    searchResults,
    isSearching,
    markAllRead,
    uploadFile,
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
    setMembersList,
    pendingAttachments,
    setPendingAttachments,
    uploadError,
    setUploadError,
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
  };
}
