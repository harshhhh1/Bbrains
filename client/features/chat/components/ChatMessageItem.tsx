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
  User,
  MessageCircle,
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
    // Regex for URLs
    const urlRegex = /https?:\/\/[^\s]+/;
    
    // First, process mentions to protect them from URL regex if they contain dots (unlikely but safe)
    let processed = content;
    const protectedMentions: Record<string, string> = {};
    
    mentions?.forEach((m, i) => {
      const placeholder = `%%MENTION_VAR_${i}%%`;
      protectedMentions[placeholder] = m;
      processed = processed.replace(new RegExp(`@${m}`, 'g'), placeholder);
    });

    // Split by URLs and Mentions
    const parts = processed.split(/(https?:\/\/[^\s]+|%%MENTION_VAR_\d+%%)/g);

    return parts.map((part, i) => {
      // Check for Mention
      if (part.startsWith('%%MENTION_VAR_')) {
        const username = protectedMentions[part];
        return (
          <span key={i} className="bg-primary/20 text-primary rounded px-1 font-medium cursor-pointer hover:bg-primary/30" onClick={() => onMention(username)}>
            @{username}
          </span>
        );
      }
      
      // Check for URL
      if (part.startsWith('http')) {
        if (part.toLowerCase().includes('msgid=')) {
          return (
            <a 
              key={i} 
              href={part} 
              className="inline-flex items-center gap-1.5 bg-[#3f4147]/80 hover:bg-[#4a4d54] text-[#c9cdfb] rounded px-2 py-0.5 text-[14px] font-medium transition-colors align-middle mx-0.5 whitespace-nowrap"
            >
              <span className="opacity-60 font-normal">#</span> 
              view message 
              <span className="opacity-40 text-[10px] mx-0.5">&gt;</span>
              <MessageCircle className="w-4 h-4 text-[#aeb3e4]" />
            </a>
          );
        }
        
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
            {part}
          </a>
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
          className={`group flex items-start gap-3 px-3 py-1.5 rounded-md transition-all relative animate-in fade-in slide-in-from-bottom-4 duration-300 ${isMentioned ? "bg-primary/5 border-l-2 border-primary" :
              isReplyToMe ? "bg-accent/5 border-l-2 border-accent" :
                isHighlighted ? "bg-brand-purple/10 ring-1 ring-brand-purple/50 animate-highlight" :
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
                    Replying to @{msg.replyTo.username || 'user'}: {msg.replyTo.content.slice(0, 30)}{msg.replyTo.content.length > 30 ? '...' : ''}
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
        <ContextMenuItem onClick={() => onProfileOpen(msg)}>
          <User className="w-4 h-4 mr-2" />
          View Profile
        </ContextMenuItem>
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
