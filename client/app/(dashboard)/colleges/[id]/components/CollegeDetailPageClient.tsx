/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, Building2, Mail, Hash, MapPin, User, Edit, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api/client";
import { toast } from "sonner";
import { EditCollegeModal } from "../components/EditCollegeModal";
import { CollegeUsersManagement } from "./_components/CollegeUsersManagement";
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

export default function CollegeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTogglePauseLoading, setIsTogglePauseLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchCollegeDetails = async () => {
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
  };

  useEffect(() => {
    if (id) {
      fetchCollegeDetails();
    }
  }, [id]);

  const handleTogglePause = async () => {
    try {
      setIsTogglePauseLoading(true);
      const res = await api.post(`/colleges/${id}/toggle-pause`, {});
      if (res.success) {
        toast.success(res.message || "College status updated.");
        fetchCollegeDetails(); // refresh
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
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/colleges")}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">College Details</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 size-4" />
            Edit Profile
          </Button>
          
          <Button 
            variant={isPaused ? "default" : "secondary"} 
            onClick={handleTogglePause}
            disabled={isTogglePauseLoading}
          >
            {isTogglePauseLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : isPaused ? (
              <Play className="mr-2 size-4" />
            ) : (
              <Pause className="mr-2 size-4" />
            )}
            {isPaused ? "Resume College" : "Pause College"}
          </Button>

          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      {isPaused && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">This college is currently paused.</p>
          <p className="text-sm">Users belonging to this institution cannot access the dashboard or perform any actions until it is resumed.</p>
        </div>
      )}

      {/* Main Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">College Name</p>
              <p className="font-medium text-lg">{college.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="size-3" /> Registration No
                </p>
                <p className="font-medium">{college.regNo}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="size-3" /> Email
                </p>
                <p className="font-medium break-all">{college.email}</p>
              </div>
              
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" /> Address
                </p>
                {college.address ? (
                  <p className="font-medium">
                    {college.address.addressLine1} {college.address.addressLine2},<br/>
                    {college.address.city}, {college.address.state} - {college.address.postalCode}, {college.address.country}
                  </p>
                ) : (
                  <p className="font-medium text-muted-foreground italic">No address provided</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Lists */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Administrators
            </CardTitle>
            <CardDescription>Primary contacts managing this college</CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No administrators found for this college.</p>
            ) : (
              <div className="space-y-4">
                {admins.map((admin: any) => (
                  <div key={admin.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {admin.userDetails?.firstName} {admin.userDetails?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{admin.email} • @{admin.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* College User Management Hub */}
      <CollegeUsersManagement
        collegeId={college.id}
        collegeName={college.name}
        initialCounts={college._count}
      />

      {isEditModalOpen && (

        <EditCollegeModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          collegeData={college}
          onSuccess={fetchCollegeDetails}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <b>{college.name}</b> and remove related data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleteLoading}>
              {isDeleteLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
