"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Bell, 
  Search, 
  Loader2,
  X
} from "lucide-react";
import { announcementApi, Announcement, User as ProfileUser } from "@/services/api/client";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/components/providers/permissions-provider";
import { AnnouncementItem } from "./AnnouncementItem";
import { PostEditor } from "./PostEditor";
import { AcknowledgeDrawer } from "./AcknowledgeDrawer";

interface AnnouncementsContentProps {
  initialAnnouncements: Announcement[];
  currentUser: ProfileUser | null;
}

export function AnnouncementsContent({ initialAnnouncements, currentUser }: AnnouncementsContentProps) {
  const ANNOUNCEMENTS_PAGE_SIZE = 10;
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get('id');
  const highlightRef = useRef<HTMLDivElement>(null);
  
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ANNOUNCEMENTS_PAGE_SIZE);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);
  const { uploadFile, isUploading, progress } = useCloudinaryUpload();
  const [attachedImage, setAttachedImage] = useState<string>("");

  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    if (highlightedId) {
      setShowHighlight(true);
      setTimeout(() => {
        const element = document.getElementById(`announcement-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      const timer = setTimeout(() => setShowHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [acknowledgedUsers, setAcknowledgedUsers] = useState<any[]>([]);
  const [fetchingAcknowledged, setFetchingAcknowledged] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const currentCollegeId = currentUser?.college?.id;

  const filteredAnnouncements = announcements.filter((a) => {
    const titleMatch = (a.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const descMatch = (a.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesQuery = titleMatch || descMatch;

    if (!currentCollegeId) return matchesQuery;
    const matchesCollege = a.isGlobal || !a.collegeId || String(a.collegeId) === String(currentCollegeId);
    return matchesQuery && matchesCollege;
  });

  const visibleAnnouncements = filteredAnnouncements.slice(0, visibleCount);
  const hasMoreAnnouncements = filteredAnnouncements.length > visibleCount;

  useEffect(() => {
    setVisibleCount(ANNOUNCEMENTS_PAGE_SIZE);
  }, [searchQuery]);

  const handlePost = async () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncement.trim()) return;
    setPosting(true);
    try {
      const response = await announcementApi.createAnnouncement({
        title: newAnnouncementTitle.trim(),
        description: newAnnouncement.trim(),
        category: "general",
        image: attachedImage || undefined,
        ...(currentCollegeId ? { collegeId: currentCollegeId } : {})
      });
      
      if (response.success && response.data) {
        setAnnouncements((prev) => [response.data!, ...prev]);
        setNewAnnouncementTitle("");
        setNewAnnouncement("");
        setAttachedImage("");
        toast.success("Announcement posted");
      } else {
        toast.error(response.message || "Post failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setPosting(false);
    }
  };

  const handleAcknowledge = async (id: string | number) => {
    setAcknowledging(String(id));
    try {
      const response = await announcementApi.acknowledgeAnnouncement(id);
      if (response.success && response.data) {
        setAnnouncements((prev) => prev.map(a => String(a.id) === String(id) ? response.data! : a));
        toast.success("Acknowledged");
      } else if (response.message === "Already acknowledged") {
        toast.info("Already acknowledged");
      }
    } catch (err) {
      toast.error("Failed to acknowledge");
    } finally {
      setAcknowledging(null);
    }
  };

  const handleViewAcknowledged = async (id: string | number) => {
    setFetchingAcknowledged(true);
    setAcknowledgeDialogOpen(true);
    try {
      const response = await announcementApi.getAcknowledgedUsers(id);
      setAcknowledgedUsers(response.success && response.data ? response.data : []);
    } catch (err) {
      setAcknowledgedUsers([]);
    } finally {
      setFetchingAcknowledged(false);
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    setDeleting(true);
    try {
      const response = await announcementApi.deleteAnnouncement(announcementToDelete);
      if (response.success) {
        setAnnouncements((prev) => prev.filter(a => String(a.id) !== announcementToDelete));
        toast.success("Deleted");
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const canCreateAnnouncement = useHasPermission("create_announcement");
  const contentBottomPadding = canCreateAnnouncement ? "16rem" : "4rem";

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col px-4 md:px-0">
      <div className="max-w-4xl mx-auto w-full" style={{ paddingBottom: contentBottomPadding }}>
        <header className="mb-10">
          <h2 className="text-4xl font-black tracking-tight">Announcements</h2>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Internal news and faculty broadcasts.</p>
        </header>

        <div className="relative mb-10 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search Announcements..."
            className="w-full bg-card/50 backdrop-blur-sm border border-border/50 shadow-inner rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-8">
          {filteredAnnouncements.length > 0 ? (
            visibleAnnouncements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                currentUser={currentUser}
                highlightedId={showHighlight ? highlightedId : null}
                onDelete={(id) => {
                  setAnnouncementToDelete(id);
                  setDeleteDialogOpen(true);
                }}
                onAcknowledge={handleAcknowledge}
                onViewAcknowledged={handleViewAcknowledged}
                acknowledging={acknowledging === String(announcement.id)}
              />
            ))
          ) : (
            <div className="py-20 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Registry Empty</h3>
              <p className="text-muted-foreground mt-2">No broadcasts matching your criteria.</p>
            </div>
          )}

          {hasMoreAnnouncements && (
            <div className="flex justify-center pt-10">
              <Button
                variant="outline"
                onClick={() => setVisibleCount(c => c + ANNOUNCEMENTS_PAGE_SIZE)}
                className="rounded-full px-8 font-bold border-primary/20 text-primary hover:bg-primary/5"
              >
                Sync Previous Records
              </Button>
            </div>
          )}
        </div>
      </div>

      {canCreateAnnouncement && (
        <PostEditor
          title={newAnnouncementTitle}
          content={newAnnouncement}
          onTitleChange={setNewAnnouncementTitle}
          onContentChange={setNewAnnouncement}
          onPost={handlePost}
          onFileSelect={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = await uploadFile(file);
              if (url) setAttachedImage(url);
            }
          }}
          attachedImage={attachedImage}
          onRemoveImage={() => setAttachedImage("")}
          isUploading={isUploading}
          uploadProgress={progress}
          posting={posting}
        />
      )}

      {/* Delete Drawer */}
      <Drawer open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} direction="right">
        <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
          <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
            <DrawerHeader className="p-6 text-left">
              <DrawerTitle className="text-2xl font-black text-destructive">Wipe Record</DrawerTitle>
              <DrawerDescription className="text-muted-foreground font-medium">
                This action will permanently purge this announcement from the registry.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="flex flex-col gap-2 p-6">
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full font-bold h-12">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Purge"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full font-bold h-12">Retain Record</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <AcknowledgeDrawer
        open={acknowledgeDialogOpen}
        onOpenChange={setAcknowledgeDialogOpen}
        users={acknowledgedUsers}
        loading={fetchingAcknowledged}
      />
    </div>
  );
}
