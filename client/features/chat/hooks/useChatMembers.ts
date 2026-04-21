import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/services/supabase/client";
import type { Member } from "@/features/chat/data";

type ChatUserRow = {
  id: string;
  username: string;
  type?: string | null;
};

type ChatUserDetailRow = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
};

export function useChatMembers(currentUserId: string) {
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const { data: users } = await supabase
          .from("user")
          .select("id, username, type");
        const { data: details } = await supabase
          .from("user_details")
          .select("user_id, first_name, last_name, avatar");

        if (users) {
          const members = (users as ChatUserRow[]).map((u) => {
            const d = (details as ChatUserDetailRow[] | null)?.find((det) => det.user_id === u.id);
            return {
              id: u.id,
              name: d ? `${d.first_name} ${d.last_name}`.trim() : u.username,
              username: u.username,
              role: (u.type === "admin" || u.type === "superadmin" ? "admin" : u.type === "teacher" ? "moderator" : "member") as "admin" | "moderator" | "member",
              avatar: d?.avatar || "",
              pronouns: "they/them",
              grade: "N/A",
              roles: [u.type || "student"],
              type: u.type || "student",
              status: "offline" as const
            };
          });
          setMembersList(members);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const currentUsername = useMemo(
    () => membersList.find((m) => m.id === currentUserId)?.username,
    [membersList, currentUserId]
  );

  return { membersList, currentUsername, loading };
}
