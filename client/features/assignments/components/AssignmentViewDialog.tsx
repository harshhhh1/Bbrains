"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { Calendar, Download, FileText, X } from "lucide-react"
import { resolveApiFileUrl } from "@/lib/file-url"
import type { Assignment } from "@/services/api/client"
import {
  fmtDate,
  getAssignmentStatus,
  getImageMimeType,
  getStatusBadgeVariant,
  getStatusLabel,
  isImageFile,
} from "../assignment-utils"

interface AssignmentViewDialogProps {
  assignment: Assignment | null
  onClose: () => void
}

export function AssignmentViewDialog({ assignment, onClose }: AssignmentViewDialogProps) {
  const assignmentFileUrl = resolveApiFileUrl(assignment?.file)
  const submissionFileUrl = resolveApiFileUrl(assignment?.submission?.filePath)

  return (
    <Drawer open={!!assignment} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-2xl font-black tracking-tight">{assignment?.title}</DrawerTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{assignment?.course?.name || "General"}</Badge>
                  {assignment ? (
                    <>
                      <Badge variant={getStatusBadgeVariant(getAssignmentStatus(assignment))}>
                        {getStatusLabel(getAssignmentStatus(assignment))}
                      </Badge>
                      <Badge variant="outline">
                        {assignment.rewardPoints ?? 0} point{(assignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                      </Badge>
                    </>
                  ) : null}
                </div>
                <DrawerDescription className="text-sm font-medium text-muted-foreground mt-2">
                  Review task details, your submission, and teacher feedback.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Description</h4>
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/50">
                  {assignment?.description || "No description provided."}
                </p>
              </div>

              {assignment?.dueDate ? (
                <div className="flex items-center gap-2 text-xs font-bold text-brand-orange bg-brand-orange/5 w-fit px-3 py-1.5 rounded-lg border border-brand-orange/10">
                  <Calendar className="h-4 w-4" />
                  Due {fmtDate(assignment.dueDate)}
                </div>
              ) : null}

              {assignment?.file ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Attached File</h4>
                  {isImageFile(assignmentFileUrl) ? (
                    <div className="rounded-2xl overflow-hidden border border-border/50">
                      <ChatImagePreview
                        attachment={{
                          url: assignmentFileUrl,
                          type: getImageMimeType(assignmentFileUrl),
                          name: "Assignment File",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 border border-border/40">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="truncate text-sm font-bold text-foreground">
                          {assignmentFileUrl.split("/").pop()?.split("?")[0] || "Assignment file"}
                        </span>
                      </div>
                      <a href={assignmentFileUrl} download target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              ) : null}

              {assignment?.submission ? (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Submission</h4>
                  <div className="space-y-4 rounded-2xl bg-muted/30 p-4 border border-border/50 shadow-inner">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(getAssignmentStatus(assignment))} className="font-bold">
                        {getStatusLabel(getAssignmentStatus(assignment))}
                      </Badge>
                      {assignment.submission.reviewStatus === "completed" ? (
                        <Badge className="bg-green-600 text-white font-bold">
                          +{assignment.rewardPoints ?? 0} point{(assignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                        </Badge>
                      ) : null}
                    </div>

                    {assignment.submission.content ? (
                      <p className="text-sm text-foreground/80 bg-background/50 p-3 rounded-xl">{assignment.submission.content}</p>
                    ) : null}

                    {assignment.submission.filePath ? (
                      isImageFile(submissionFileUrl) ? (
                        <div className="rounded-xl overflow-hidden border border-border/40 shadow-sm">
                          <ChatImagePreview
                            attachment={{
                              url: submissionFileUrl,
                              type: getImageMimeType(submissionFileUrl),
                              name: "Submitted File",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl bg-background/50 p-3 border border-border/40 shadow-sm">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="truncate text-sm font-bold">
                              {submissionFileUrl.split("/").pop()?.split("?")[0] || "Submitted file"}
                            </span>
                          </div>
                          <a href={submissionFileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      )
                    ) : null}

                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 px-1">
                      <span>Submitted Log</span>
                      <span>{fmtDate(assignment.submission.submittedAt)}</span>
                    </div>

                    {assignment.submission.reviewRemark ? (
                      <div className="rounded-xl border-2 border-brand-orange/20 bg-brand-orange/5 px-4 py-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <p className="mb-1 text-xs font-black uppercase tracking-widest text-brand-orange">Teacher Verdict</p>
                        <p className="text-sm font-bold text-foreground/90 leading-relaxed italic">&quot;{assignment.submission.reviewRemark}&quot;</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 bg-muted/5">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Close View</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
