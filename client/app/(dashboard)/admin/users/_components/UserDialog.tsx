"use client";

import { User as UserIcon, Phone, MapPin, Building, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiUser } from "@/lib/types/api";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApiUser | null;
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const isEditing = !!user;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>{isEditing ? "Edit User" : "Add New User"}</DrawerTitle>
                <DrawerDescription>
                  {isEditing ? "Update user profile details and settings." : "Create a new user account in the system."}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input defaultValue={user?.userDetails?.firstName} placeholder="First name" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input defaultValue={user?.userDetails?.lastName} placeholder="Last name" />
                </div>
              </div>
              <div>
                <Label>Username</Label>
                <Input defaultValue={user?.username} placeholder="Username" disabled={isEditing} />
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue={user?.email} placeholder="Email" type="email" disabled={isEditing} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select defaultValue={user?.type || "student"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone</Label>
                  <Input defaultValue={user?.userDetails?.phone} placeholder="+91 ..." />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input defaultValue={user?.userDetails?.dob?.slice(0, 10)} type="date" />
                </div>
              </div>
              <div>
                <Label>Gender</Label>
                <Select defaultValue={user?.userDetails?.sex || ""}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Additional Information
              </h3>
              <div>
                <Label>Bio</Label>
                <Textarea defaultValue={user?.userDetails?.bio} placeholder="Brief description about the user..." className="resize-none" rows={3} />
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button onClick={() => onOpenChange(false)}>
              {isEditing ? "Save Changes" : "Add User"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
