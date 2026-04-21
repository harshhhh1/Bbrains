"use client";

import { Separator } from "@/components/ui/separator";
import { ChatMessageItem } from "./ChatMessageItem";
import type { Message } from "@/features/chat/data";

interface ChatThreadListProps {
  grouped: { label: string; messages: Message[] }[];
  currentUserId: string | null;
  currentUsername: string | null;
  highlightedMsgId: string | null;
  editingMsgId: string | null;
  editContent: string;
  setEditContent: (val: string) => void;
  onEditSave: () => void;
  onCancelEdit: () => void;
  onReply: (reply: { id: string; username: string; content: string }) => void;
  onDelete: (id: string) => void;
  onMention: (username: string) => void;
  onProfileOpen: (msg: any) => void;
  onCopy: (content: string) => void;
  onCopyLink: (id: string) => void;
  onEditStart: (id: string, content: string) => void;
}

export function ChatThreadList({
  grouped,
  currentUserId,
  currentUsername,
  highlightedMsgId,
  editingMsgId,
  editContent,
  setEditContent,
  onEditSave,
  onCancelEdit,
  onReply,
  onDelete,
  onMention,
  onProfileOpen,
  onCopy,
  onCopyLink,
  onEditStart,
}: ChatThreadListProps) {
  return (
    <div className="space-y-1">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 my-4">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{group.label}</span>
            <Separator className="flex-1" />
          </div>
          {group.messages.map((msg) => {
            const isMentioned = currentUsername ? msg.mentions?.includes(currentUsername) : false;
            const isReplyToMe = msg.replyTo && typeof msg.replyTo !== 'string' && msg.replyTo.username === currentUsername;
            
            return (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                isMentioned={!!isMentioned}
                isReplyToMe={!!isReplyToMe}
                isHighlighted={highlightedMsgId === msg.id}
                isEditing={editingMsgId === msg.id}
                editContent={editContent}
                setEditContent={setEditContent}
                onEditSave={onEditSave}
                onCancelEdit={onCancelEdit}
                onReply={onReply}
                onDelete={onDelete}
                onMention={onMention}
                onProfileOpen={onProfileOpen}
                onCopy={onCopy}
                onCopyLink={onCopyLink}
                onEditStart={onEditStart}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
