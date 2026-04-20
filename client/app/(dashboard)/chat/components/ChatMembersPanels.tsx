"use client";

import { ChatSidebarRight } from "@/features/chat/components/ChatSidebarRight";
import { Memberssidebar } from "@/features/chat/components/MembersSidebar";
import type { Member } from "@/features/chat/data";

type ChatMembersPanelsProps = {
  isMounted: boolean;
  open: boolean;
  members: Member[];
  currentUserId: string;
  onSelectUser: (user: Member) => void;
  onCloseMobile: () => void;
  onOpenProfileMobile: (userId: string) => void;
};

export function ChatMembersPanels({
  isMounted,
  open,
  members,
  currentUserId,
  onSelectUser,
  onCloseMobile,
  onOpenProfileMobile,
}: ChatMembersPanelsProps) {
  if (!isMounted || !open) {
    return null;
  }

  return (
    <>
      <ChatSidebarRight members={members} currentUserId={currentUserId} onSelectUser={(user) => onSelectUser(user)} />

      <div className="md:hidden">
        <div
          className="fixed inset-0 z-90 animate-in fade-in duration-300 bg-black/40 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
        <Memberssidebar
          members={members}
          currentUserId={currentUserId}
          onClose={onCloseMobile}
          onOpenProfile={onOpenProfileMobile}
        />
      </div>
    </>
  );
}
