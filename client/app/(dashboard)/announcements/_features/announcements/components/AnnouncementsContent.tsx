"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Bell, 
  Search, 
  Trash2,
  ThumbsUp,
  Share2,
  Paperclip,
  Send,
  Loader2,
  X,
  Users
} from "lucide-react";
import { announcementApi, Announcement, User as ProfileUser } from "@/services/api/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import Image from "next/image";
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
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      const timer = setTimeout(() => setShowHighlight(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [acknowledgedUsers, setAcknowledgedUsers] = useState<{ userId: string; userDetails?: { firstName: string; lastName: string; avatar?: string | null }; createdAt: string }[]>([]);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const currentCollegeId = currentUser?.college?.id;

  // Filter announcements to match the search query and ensure they are specific to the user's college
  const filteredAnnouncements = announcements.filter(
    (a) => {
      const titleMatch = (a.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const descMatch = (a.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesQuery = titleMatch || descMatch;

      if (!currentCollegeId) return matchesQuery;

      const collegeId = a.collegeId;
      const isGlobal = a.isGlobal;
      const matchesCollege = isGlobal || collegeId === undefined || collegeId === null || collegeId === currentCollegeId;

      return matchesQuery && matchesCollege;
    }
  );
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
        // Include collegeId so the backend associates this announcement with the correct college
        ...(currentCollegeId ? { collegeId: currentCollegeId } : {})
      });
      
      if (response.success && response.data) {
        setAnnouncements([response.data, ...announcements]);
        setVisibleCount((current) => Math.max(current, ANNOUNCEMENTS_PAGE_SIZE));
        setNewAnnouncementTitle("");
        setNewAnnouncement("");
        setAttachedImage("");
        toast.success("Announcement posted successfully");
      } else {
        toast.error(response.message || "Failed to post announcement");
      }
    } catch (err) {
      toast.error("Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  const canCreateAnnouncement = useHasPermission("create_announcement");
  const canManageAnnouncement = useHasPermission("manage_announcement");
  const mobileComposerOffset = "calc(4rem + env(safe-area-inset-bottom, 0px) + 0.75rem)";
  const contentBottomPadding = canCreateAnnouncement
    ? "calc(15rem + 4rem + env(safe-area-inset-bottom, 0px))"
    : "8rem";

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    
    setDeleting(true);
    try {
      const response = await announcementApi.deleteAnnouncement(announcementToDelete);
      
      if (response.success) {
        setAnnouncements(announcements.filter(a => String(a.id) !== announcementToDelete));
        toast.success("Announcement deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete announcement");
      }
    } catch (err) {
      toast.error("Failed to delete announcement");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleAcknowledge = async (id: string) => {
    setAcknowledging(id);
    try {
      const response = await announcementApi.acknowledgeAnnouncement(id);
      
      if (response.success && response.data) {
        setAnnouncements(announcements.map(a => 
          String(a.id) === id ? response.data! : a
        ));
        toast.success("Acknowledged successfully");
      } else {
        toast.error(response.message || "Failed to acknowledge");
      }
    } catch (err) {
      toast.error("Failed to acknowledge");
    } finally {
      setAcknowledging(null);
    }
  };

  const handleViewAcknowledged = async (id: string) => {
    setCurrentAnnouncementId(id);
    try {
      const response = await announcementApi.getAcknowledgedUsers(id);
      if (response.success && response.data) {
        setAcknowledgedUsers(response.data);
      } else {
        setAcknowledgedUsers([]);
      }
    } catch (err) {
      setAcknowledgedUsers([]);
    }
    setAcknowledgeDialogOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="max-w-4xl mx-auto w-full" style={{ paddingBottom: contentBottomPadding }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Announcements</h2>
            <p className="text-muted-foreground mt-1">Stay updated with the latest news from your faculty.</p>
          </div>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            placeholder="Search announcements..."
            className="w-full bg-card border border-border shadow-sm rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {filteredAnnouncements.length > 0 ? (
            visibleAnnouncements.map((announcement, index) => {
              const annId = String(announcement.id);
              const isHighlighted = annId === highlightedId && showHighlight;
              return (
              <article 
                key={annId} 
                ref={isHighlighted ? highlightRef : null}
                id={isHighlighted ? 'highlighted-announcement' : undefined}
                className={`bg-card border border-border shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md ${isHighlighted ? 'ring-4 ring-primary animate-pulse' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={announcement.user?.userDetails?.avatar || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(announcement.user?.userDetails?.firstName?.[0]) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-foreground">
                          {announcement.user?.userDetails?.firstName || 'System'} {announcement.user?.userDetails?.lastName || ''}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize" suppressHydrationWarning>
                          {formatDistanceToNow(new Date(announcement.createdAt || Date.now()), { addSuffix: true })} • {announcement.category}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    {announcement.title && announcement.title !== newAnnouncement.trim().split('\n')[0].substring(0, 60) + (newAnnouncement.trim().split('\n')[0].length > 60 ? "..." : "") && (
                       <h3 className="text-xl font-bold text-foreground">{announcement.title}</h3>
                    )}
                    <div className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {announcement.description}
                    </div>
                    {announcement.image && (
                      <div className="mt-5 relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border border-border">
                        <Image src={announcement.image} alt="Attachment" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleAcknowledge(annId)}
                      disabled={acknowledging === annId}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {acknowledging === annId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ThumbsUp className="h-4 w-4" />
                      )}
                      Acknowledge {announcement.acknowledgedBy && announcement.acknowledgedBy.length > 0 && `(${announcement.acknowledgedBy.length})`}
                    </button>
                    {announcement.acknowledgedBy && announcement.acknowledgedBy.length > 0 && (
                      <button 
                        onClick={() => handleViewAcknowledged(annId)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        View
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canManageAnnouncement && (
                      <button 
                        onClick={() => handleDeleteClick(annId)}
                        className="text-muted-foreground hover:text-destructive transition-colors mr-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/announcements?id=${annId}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard");
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
              );
            })
          ) : (
            <div className="py-12 text-center rounded-xl border-2 border-dashed border-border">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No announcements found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Check back later for updates"}
              </p>
            </div>
          )}

          {hasMoreAnnouncements && (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + ANNOUNCEMENTS_PAGE_SIZE)}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-6 py-3 rounded-xl transition-colors"
              >
                Load Previous Announcements
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Bar for Teachers/Admins */}
      {canCreateAnnouncement && (
        <div
          className="sticky left-0 right-0 max-w-4xl mx-auto w-full z-10 px-4 md:px-0 pointer-events-none md:bottom-6"
          style={{ bottom: mobileComposerOffset }}
        >
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl flex flex-col gap-3 p-3 pointer-events-auto">
            {attachedImage && (
              <div className="relative w-full max-w-xs h-32 mb-1 rounded-xl overflow-hidden border border-border ml-1 mt-1">
                  <Image src={attachedImage} alt="Attachment preview" fill className="object-cover" />
                  <button onClick={() => setAttachedImage("")} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 mb-1 ml-1 mt-1 self-start text-primary text-xs font-bold px-3 py-1.5 bg-primary/10 rounded-full">
                 <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading {progress}% ...
              </div>
            )}
            <input
              className="w-full bg-transparent border-b border-border py-2 px-1 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Announcement title..."
              value={newAnnouncementTitle}
              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
              maxLength={100}
            />
            <div className="flex items-end gap-3 w-full">
              <button 
                onClick={() => document.getElementById("announcement-file-upload")?.click()}
                disabled={isUploading}
                className="p-3 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input 
                 id="announcement-file-upload" 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const url = await uploadFile(file);
                     if (url) setAttachedImage(url);
                   }
                   e.target.value = '';
                 }} 
              />
              <textarea
                className="flex-1 bg-transparent border-none py-3 px-2 text-sm text-foreground focus:outline-none focus:ring-0 resize-none min-h-11 max-h-37.5 placeholder:text-muted-foreground"
                placeholder="Announcement content..."
                value={newAnnouncement}
                onChange={(e) => {
                  setNewAnnouncement(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePost();
                  }
                }}
              />
              <button
                onClick={handlePost}
                disabled={!newAnnouncementTitle.trim() || !newAnnouncement.trim() || posting}
                className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Drawer open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} direction="right">
        <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
          <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
            <DrawerHeader className="border-b border-border/60 p-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DrawerTitle className="text-xl font-black text-destructive">Delete Announcement</DrawerTitle>
                  <DrawerDescription className="text-sm font-medium text-muted-foreground">
                    Are you sure you want to delete this announcement? This action cannot be undone.
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 p-6">
               <p className="text-sm text-foreground/70 leading-relaxed italic border-l-4 border-destructive/20 pl-4 py-2 bg-destructive/5 rounded-r-xl">
                 Removing this announcement will hide it from all students and faculty immediately.
               </p>
            </div>

            <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end gap-3">
              <DrawerClose asChild>
                <Button variant="outline" className="rounded-xl font-bold flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl font-bold flex-1">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Confirm Delete
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={acknowledgeDialogOpen} onOpenChange={setAcknowledgeDialogOpen} direction="right">
        <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
          <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
            <DrawerHeader className="border-b border-border/60 p-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DrawerTitle className="text-xl font-black">Acknowledged By</DrawerTitle>
                  <DrawerDescription className="text-sm font-medium text-muted-foreground">
                    List of users who have confirmed reading this update.
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {acknowledgedUsers.length > 0 ? (
                <div className="space-y-4">
                  {acknowledgedUsers.map((user) => (
                    <div key={user.userId} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <Avatar className="h-10 w-10 border border-primary/20 shadow-sm">
                        {user.userDetails?.avatar && (
                          <AvatarImage src={user.userDetails.avatar} className="object-cover" />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                          {user.userDetails?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {user.userDetails?.firstName} {user.userDetails?.lastName}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {formatDistanceToNow(new Date(user.createdAt || Date.now()), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground/60 tracking-tight italic">No acknowledgments yet.</p>
                </div>
              )}
            </div>

            <DrawerFooter className="border-t border-border/60 p-6">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Close List</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
