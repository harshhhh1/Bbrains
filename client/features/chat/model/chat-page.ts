import type { Message } from "@/features/chat/api/data";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export function getDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);
  const diff = today.getTime() - currentDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return currentDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function groupMessagesByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = "";

  messages.forEach((chatMessage) => {
    const label = getDateLabel(chatMessage.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [chatMessage] });
      return;
    }

    groups[groups.length - 1].messages.push(chatMessage);
  });

  return groups;
}
