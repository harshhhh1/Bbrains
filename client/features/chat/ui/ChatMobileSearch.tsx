"use client";

import type { RefObject } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Message } from "@/features/chat/api/data";

type ChatMobileSearchProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  isSearching: boolean;
  searchResults: Message[];
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onSelectSearchResult: (message: Message) => Promise<void>;
};

export function ChatMobileSearch({
  inputRef,
  searchQuery,
  isSearching,
  searchResults,
  onSearchChange,
  onClearSearch,
  onSelectSearchResult,
}: ChatMobileSearchProps) {
  return (
    <div className="border-b border-border bg-card px-3 py-3 sm:hidden">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search this chat..."
          className="pl-10 pr-10"
        />
        <button
          type="button"
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
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
                onClick={() => void onSelectSearchResult(chatMessage)}
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
  );
}
