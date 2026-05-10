"use client";

import React from "react";
import { Paperclip, Send, Loader2, X } from "lucide-react";
import Image from "next/image";

export function PostEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onPost,
  onFileSelect,
  attachedImage,
  onRemoveImage,
  isUploading,
  uploadProgress,
  posting,
  mobileComposerOffset = 0,
}) {
  return (
    <div
      className="sticky left-0 right-0 max-w-4xl mx-auto w-full z-10 px-4 md:px-0 pointer-events-none md:bottom-6"
      style={{ bottom: mobileComposerOffset }}
    >
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl flex flex-col gap-3 p-3 pointer-events-auto">
        {attachedImage && (
          <div className="relative w-full max-w-xs h-32 mb-1 rounded-xl overflow-hidden border border-border ml-1 mt-1">
            <Image
              src={attachedImage}
              alt="Attachment preview"
              fill
              className="object-cover"
            />
            <button
              onClick={onRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center gap-2 mb-1 ml-1 mt-1 self-start text-primary text-xs font-bold px-3 py-1.5 bg-primary/10 rounded-full">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading{" "}
            {uploadProgress}% ...
          </div>
        )}

        <input
          className="w-full bg-transparent border-b border-border py-2 px-1 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground font-bold"
          placeholder="Announcement title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={100}
        />

        <div className="flex items-end gap-3 w-full">
          <button
            onClick={() =>
              document.getElementById("announcement-file-upload")?.click()
            }
            disabled={isUploading}
            className="p-3 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            id="announcement-file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />

          <textarea
            className="flex-1 bg-transparent border-none py-3 px-2 text-sm text-foreground focus:outline-none focus:ring-0 resize-none min-h-11 max-h-37.5 placeholder:text-muted-foreground"
            placeholder="Announcement content..."
            value={content}
            onChange={(e) => {
              onContentChange(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onPost();
              }
            }}
          />

          <button
            onClick={onPost}
            disabled={!title.trim() || !content.trim() || posting}
            className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {posting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
