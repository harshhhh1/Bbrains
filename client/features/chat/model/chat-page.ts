import { getDateLabel } from "@/lib/date-utils";
import type { Message } from "@/features/chat/api/data";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

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
