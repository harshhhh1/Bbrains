"use client";

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
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Memberssidebar
          members={members}
          currentUserId={currentUserId}
          onClose={() => {}}
          onOpenProfile={(userId) => {
            const user = members.find(m => m.id === userId);
            if (user) onSelectUser(user);
          }}
        />
      </div>

      {/* Mobile sidebar */}
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
