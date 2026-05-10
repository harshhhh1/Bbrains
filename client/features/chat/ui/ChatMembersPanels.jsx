"use client";

import { Memberssidebar } from "@/features/chat/ui/MembersSidebar";

export function ChatMembersPanels({
  isMounted,
  open,
  members,
  currentUserId,
  onSelectUser,
  onCloseMobile,
  onOpenProfileMobile,
}) {
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
            const user = members.find((m) => m.id === userId);
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
