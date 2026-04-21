"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/features/chat/data";

interface ChatDialogsProps {
  profileUser: Member | null;
  setProfileUser: (user: Member | null) => void;
  deleteMsgId: string | null;
  setDeleteMsgId: (id: string | null) => void;
  onDeleteConfirm: () => void;
}

export function ChatDialogs({
  profileUser,
  setProfileUser,
  deleteMsgId,
  setDeleteMsgId,
  onDeleteConfirm
}: ChatDialogsProps) {
  return (
    <>
      <Dialog open={!!profileUser} onOpenChange={() => setProfileUser(null)}>
        <DialogContent className="sm:max-w-sm border-none bg-card">
          <div className="bg-primary/10 h-20 -mx-6 -mt-6 rounded-t-lg" />
          <div className="-mt-12 flex flex-col items-center p-4">
            <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
              <AvatarFallback 
                name={profileUser?.username || profileUser?.name} 
                className="bg-primary text-primary-foreground text-2xl font-bold"
              >
                {profileUser?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DialogHeader className="w-full">
              <DialogTitle className="font-bold text-center text-xl text-foreground mt-4">
                {profileUser?.name}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-1 text-center">@{profileUser?.username}</p>
            <Badge variant="secondary" className="mt-4 capitalize px-3 py-1 text-xs">
              {profileUser?.role}
            </Badge>
            
            <div className="w-full mt-6 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About Me</div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                No bio provided.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteMsgId} onOpenChange={() => setDeleteMsgId(null)}>
        <AlertDialogContent className="bg-card border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this message? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-none px-6"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
