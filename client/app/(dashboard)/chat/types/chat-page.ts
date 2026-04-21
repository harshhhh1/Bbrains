import type { ChatMentionUser } from "@/services/api/client";
import type { Member, Message } from "@/features/chat/data";

export type SelectedMention = {
  id: string;
  username: string;
};

export type ReplyingMessage = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  content: string;
} | null;

export type PendingAttachment = {
  file: File;
  previewUrl: string;
};

export type GroupedMessages = {
  label: string;
  messages: Message[];
}[];

export type ChatPageState = {
  messages: Message[];
  loading: boolean;
  isConnected: boolean;
  currentUserId: string | null;
  isUploading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchResults: Message[];
  isSearching: boolean;
  message: string;
  membersPanelOpen: boolean;
  isMounted: boolean;
  profileUser: Member | null;
  showProfile: boolean;
  editingMsgId: string | null;
  replyingMsg: ReplyingMessage;
  mentionQuery: string | null;
  mentionIndex: number;
  mentionSuggestions: ChatMentionUser[];
  membersList: Member[];
  pendingAttachments: PendingAttachment[];
  uploadError: string | null;
  searchQuery: string;
  isSearchMode: boolean;
  isMobileSearchOpen: boolean;
  hasNewMessages: boolean;
  currentUsername: string | null;
  groupedMessages: GroupedMessages;
};
