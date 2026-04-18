import { announcementApi } from "@/services/api/client";
import { AnnouncementsClient } from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  const announcementsRes = await announcementApi.getAnnouncements();
  const announcements = announcementsRes.success ? announcementsRes.data || [] : [];

  return <AnnouncementsClient initialAnnouncements={announcements as any} />;
}
