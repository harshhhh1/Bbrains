"use client";

import { useRef, useEffect } from "react";
import { ImagePlus, Smile, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  message: string;
  setMessage: (val: string) => void;
  onSend: () => void;
  isUploading: boolean;
  replyingMsg: { id: string; username: string; content: string } | null;
  setReplyingMsg: (msg: { id: string; username: string; content: string } | null) => void;
  pendingAttachments: { file: File; previewUrl: string }[];
  setPendingAttachments: (attachments: { file: File; previewUrl: string }[]) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function ChatInput({
  message,
  setMessage,
  onSend,
  isUploading,
  replyingMsg,
  setReplyingMsg,
  pendingAttachments,
  setPendingAttachments,
  inputRef
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      pendingAttachments.forEach(att => URL.revokeObjectURL(att.previewUrl));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPending = files.map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f)
    }));
    setPendingAttachments([...pendingAttachments, ...newPending]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    const att = pendingAttachments[index];
    URL.revokeObjectURL(att.previewUrl);
    setPendingAttachments(pendingAttachments.filter((_, i) => i !== index));
  };

  return (
    <div className="px-3 py-2 border-t border-border bg-card mt-auto pb-9 ">
      {replyingMsg && (
        <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs">
          <span className="text-muted-foreground">
            Replying to <span className="font-medium text-foreground">@{replyingMsg.username}</span>: {replyingMsg.content.slice(0, 50)}{replyingMsg.content.length > 50 ? "..." : ""}
          </span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setReplyingMsg(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted/30 rounded-lg">
          {pendingAttachments.map((att, index) => (
            <div key={index} className="relative group">
              <img
                src={att.previewUrl}
                alt="preview"
                className="h-16 w-16 object-cover rounded-md border border-border"
              />
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 shadow-sm hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex-1 flex flex-col gap-2 relative">
          <div className="flex-1 relative flex items-center bg-background border border-input rounded-full transition-all duration-300 focus-within:ring-1 focus-within:ring-ring">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message #Global Chat"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="px-2 text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
        {(message.trim() || pendingAttachments.length > 0) && (
          <Button
            size="icon"
            onClick={onSend}
            disabled={isUploading}
            className="shrink-0 h-8 w-8"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
