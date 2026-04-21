"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Reply,
  Copy,
  Pencil,
  Trash2,
  Link,
  AtSign,
} from "lucide-react";
import { ChatImagePreview } from "@/components/chat-image-preview";
import type { Message } from "@/features/chat/data";

interface ChatMessageItemProps {
  msg: Message;
  currentUserId: string | null;
  currentUsername: string | null;
  isMentioned: boolean;
  isReplyToMe: boolean;
  isHighlighted: boolean;
  isEditing: boolean;
  editContent: string;
  setEditContent: (val: string) => void;
  onEditSave: () => void;
  onCancelEdit: () => void;
  onReply: (reply: { id: string; username: string; content: string }) => void;
  onDelete: (id: string) => void;
  onMention: (username: string) => void;
  onProfileOpen: (msg: Message) => void;
  onCopy: (content: string) => void;
  onCopyLink: (id: string) => void;
  onEditStart: (id: string, content: string) => void;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessageItem({
  msg,
  currentUserId,
  currentUsername,
  isMentioned,
  isReplyToMe,
  isHighlighted,
  isEditing,
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
}: ChatMessageItemProps) {
  const [hovered, setHovered] = useState(false);
  const isOwn = msg.user.id === currentUserId;

  const renderContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) return content;
    let result = content;
    mentions.forEach((m) => {
      result = result.replace(`@${m}`, `%%MENTION_${m}%%`);
    });
    const parts = result.split(/(%%MENTION_\w+%%)/);
    return parts.map((part, i) => {
      const match = part.match(/%%MENTION_(\w+)%%/);
      if (match) {
        return (
          <span key={i} className="bg-primary/20 text-primary rounded px-1 font-medium">
            @{match[1]}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          id={`msg-${msg.id}`}
          className={`group flex items-start gap-3 px-3 py-1.5 rounded-md transition-all relative animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            isMentioned ? "bg-primary/5 border-l-2 border-primary" : 
            isReplyToMe ? "bg-accent/5 border-l-2 border-accent" :
            isHighlighted ? "bg-primary/10 ring-1 ring-primary/50" :
            "hover:bg-muted/50"
          }`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button onClick={() => onProfileOpen(msg)}>
            <Avatar className="w-9 h-9 shrink-0 mt-0.5">
              <AvatarFallback name={msg.user.username} className="bg-primary/10 text-primary text-xs">
                {msg.user.avatar || msg.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <button
                onClick={() => onProfileOpen(msg)}
                className="font-semibold text-sm text-foreground hover:underline"
              >
                {msg.user.name}
              </button>
              <span className="text-xs text-muted-foreground">{formatTime(new Date(msg.createdAt))}</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onEditSave();
                    if (e.key === "Escape") onCancelEdit();
                  }}
                  className="flex-1 bg-background border border-input rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
                <Button size="sm" onClick={onEditSave}>Save</Button>
              </div>
            ) : (
              <>
                {msg.replyTo && typeof msg.replyTo !== 'string' && (
                    <p className="mb-1 text-xs text-muted-foreground border-l-2 border-primary pl-2 italic">
                      Replying to @{msg.replyTo.username || 'user'}: {msg.replyTo.content.slice(0,30)}{msg.replyTo.content.length > 30 ? '...' : ''}
                    </p>
                )}
                <p className="text-sm text-foreground/90 wrap-break-word">{renderContent(msg.content, msg.mentions)}</p>
              </>
            )}
            {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.attachments.map((att, idx) => (
                    <ChatImagePreview
                      key={`${msg.id}-att-${idx}`}
                      attachment={att}
                      className="max-w-[200px]"
                    />
                  ))}
                </div>
            )}
          </div>

          {/* Inline Message Actions (Visible on hover) */}
          {hovered && !isEditing && (
            <div className="absolute right-2 -top-3 flex items-center bg-card border border-border rounded-md shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onReply({ id: msg.id, username: msg.user.username, content: msg.content })}>
                    <Reply className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(msg.content)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
              {isOwn && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditStart(msg.id, msg.content)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(msg.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onReply({ id: msg.id, username: msg.user.username, content: msg.content })}>
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMention(msg.user.username)}>
          <AtSign className="w-4 h-4 mr-2" />
          Mention User
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onCopy(msg.content)}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Message
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCopyLink(msg.id)}>
          <Link className="w-4 h-4 mr-2" />
          Copy Message Link
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem 
              variant="destructive" 
              onClick={() => onDelete(msg.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
