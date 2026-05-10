/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CollegeInfoCard } from "@/features/colleges/detail/ui/CollegeInfoCard";
import { CollegeAdminsCard } from "@/features/colleges/detail/ui/CollegeAdminsCard";
import { CollegeActions } from "@/features/colleges/detail/ui/CollegeActions";

export default function CollegeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { user, loading: userLoading } = useUser();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTogglePauseLoading, setIsTogglePauseLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchCollegeDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/colleges/${id}`);
      if (res.success && res.data) {
        setCollege(res.data);
      } else {
        toast.error("Failed to load college details.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading the college.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!userLoading) {
      if (!user || user.type !== "superadmin") {
        router.replace("/dashboard");
      } else if (id) {
        fetchCollegeDetails();
      }
    }
  }, [id, user, userLoading, router, fetchCollegeDetails]);

  if (userLoading || !user || user.type !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-10 animate-spin text-brand-purple/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Verifying Authority...
        </p>
      </div>
    );
  }

  const handleTogglePause = async () => {
    try {
      setIsTogglePauseLoading(true);
      const res = await api.post(`/colleges/${id}/toggle-pause`, {});
      if (res.success) {
        toast.success(res.message || "College status updated.");
        fetchCollegeDetails();
      } else {
        toast.error(res.message || "Failed to update college status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while pausing/resuming.");
    } finally {
      setIsTogglePauseLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleteLoading(true);
      const res = await api.delete(`/colleges/${id}`);
      if (res.success) {
        toast.success("College deleted successfully.");
        router.push("/colleges");
      } else {
        toast.error(res.message || "Failed to delete college.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting college.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleViewAsAdmin = () => {
    document.cookie = `impersonateCollegeId=${college.id}; path=/; max-age=86400; SameSite=Lax`;
    toast.success(`Switching context to ${college.name}`);
    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <p className="text-muted-foreground">College not found.</p>
        <Button variant="outline" onClick={() => router.push("/colleges")}>
          Go Back
        </Button>
      </div>
    );
  }

  const isPaused = college.features?.isPaused === true;
  const admins = college.users || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/colleges")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">College Details</h1>
        </div>

        <CollegeActions
          isPaused={isPaused}
          isTogglePauseLoading={isTogglePauseLoading}
          onViewAsAdmin={handleViewAsAdmin}
          onTogglePause={handleTogglePause}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      </div>

      {isPaused && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">This college is currently paused.</p>
          <p className="text-sm">
            Users belonging to this institution cannot access the dashboard or
            perform any actions until it is resumed.
          </p>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <CollegeInfoCard college={college} onUpdate={fetchCollegeDetails} />
        <CollegeAdminsCard
          collegeId={college.id}
          admins={admins}
          onUpdate={fetchCollegeDetails}
        />
      </div>

      {/* Modals & Dialogs */}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <b>{college.name}</b> and remove related data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
