"use client";

import { Hash, Search, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function ChannelHeader({
  channelName,
  showMembers,
  messageCount,
  isConnected,
  onToggleMembers,
  onSearch,
  onClearSearch,
  searchQuery,
  onOpenSearch,
}) {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card rounded-t-lg shrink-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <Hash className="w-5 h-5 text-muted-foreground shrink-0" />
        <h2 className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
          {channelName}
        </h2>
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
          {messageCount} messages
        </Badge>
        <div
          className={`h-2 w-2 rounded-full ml-1 ${isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search messages..."
            className="bg-background border border-input rounded-md pl-7 pr-8 py-1 text-xs outline-none focus:ring-1 focus:ring-ring w-32 md:w-40 placeholder:text-muted-foreground"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden h-8 w-8 p-0"
          onClick={onOpenSearch}
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMembers}
          className={`h-8 gap-1.5 ${showMembers ? "bg-muted" : ""}`}
        >
          <Users className="h-4 w-4" />
          <span className="hidden md:inline text-xs">Members</span>
        </Button>
      </div>
    </div>
  );
}
