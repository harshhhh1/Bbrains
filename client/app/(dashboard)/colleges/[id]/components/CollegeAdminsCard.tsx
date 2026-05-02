/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { User, Edit2, Trash2, Plus, X, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface CollegeAdminsCardProps {
  collegeId: number;
  admins: any[];
  onUpdate: () => void;
}

export function CollegeAdminsCard({ collegeId, admins, onUpdate }: CollegeAdminsCardProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    sex: "other" as const,
    dob: "2000-01-01",
    collegeId: collegeId
  });

  const handleAddAdmin = async () => {
    try {
      setLoading(true);
      const res = await api.post("/user/admins", formData);
      if (res.success) {
        toast.success("Administrator added successfully");
        setIsAddDialogOpen(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          sex: "other",
          dob: "2000-01-01",
          collegeId: collegeId
        });
        onUpdate();
      } else {
        toast.error(res.message || "Failed to add administrator");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteUserId) return;
    try {
      setLoading(true);
      const res = await api.delete(`/user/delete/${deleteUserId}`);
      if (res.success) {
        toast.success("Administrator removed successfully");
        setDeleteUserId(null);
        onUpdate();
      } else {
        toast.error(res.message || "Failed to remove administrator");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Administrators
            </CardTitle>
            <CardDescription>Primary contacts managing this college</CardDescription>
          </div>
          <Button 
            variant={isManaging ? "secondary" : "ghost"} 
            size="icon" 
            onClick={() => setIsManaging(!isManaging)}
          >
            {isManaging ? <X className="size-4" /> : <Edit2 className="size-4" />}
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {isManaging && (
            <div className="mb-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Administrator
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Administrator</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account for this college.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName} 
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName} 
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={formData.username} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddAdmin} disabled={loading}>
                      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Add Admin
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {admins.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No administrators found for this college.</p>
          ) : (
            <div className="space-y-4">
              {admins.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 hover:bg-muted/50 transition-colors">
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
                  {isManaging && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteUserId(admin.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this administrator account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
