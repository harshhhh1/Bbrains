"use client";

import { Hash, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  title: string;
  messageCount: number;
  isConnected: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showMembers: boolean;
  setShowMembers: (show: boolean) => void;
}

export function ChatHeader({
  title,
  messageCount,
  isConnected,
  searchQuery,
  setSearchQuery,
  showMembers,
  setShowMembers
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-lg">
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-foreground">{title}</h2>
        <Badge variant="secondary" className="text-xs">{messageCount} messages</Badge>
        <span
          className={`h-2 w-2 rounded-full ml-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="bg-background border border-input rounded-md pl-7 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring w-40 placeholder:text-muted-foreground"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMembers(!showMembers)}
          className="hidden md:flex"
        >
          <Users className="w-4 h-4 mr-1" />
          Members
        </Button>
      </div>
    </div>
  );
}
