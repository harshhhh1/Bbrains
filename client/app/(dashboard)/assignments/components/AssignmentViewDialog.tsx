"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { Calendar, Download, FileText } from "lucide-react"
import { resolveApiFileUrl } from "@/lib/file-url"
import type { Assignment } from "@/services/api/client"
import {
  fmtDate,
  getAssignmentStatus,
  getImageMimeType,
  getStatusBadgeVariant,
  getStatusLabel,
  isImageFile,
} from "../utils"

interface AssignmentViewDialogProps {
  assignment: Assignment | null
  onClose: () => void
}

export function AssignmentViewDialog({ assignment, onClose }: AssignmentViewDialogProps) {
  const assignmentFileUrl = resolveApiFileUrl(assignment?.file)
  const submissionFileUrl = resolveApiFileUrl(assignment?.submission?.filePath)

  return (
    <Dialog open={!!assignment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{assignment?.title}</DialogTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
          <DialogDescription>
            Review the task details, your uploaded file, and the teacher&apos;s latest feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div>
            <h4 className="mb-1 text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              {assignment?.description || "No description provided."}
            </p>
          </div>

          {assignment?.dueDate ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due {fmtDate(assignment.dueDate)}
            </div>
          ) : null}

          {assignment?.file ? (
            <div>
              <h4 className="mb-2 text-sm font-medium">Attached File</h4>
              {isImageFile(assignmentFileUrl) ? (
                <ChatImagePreview
                  attachment={{
                    url: assignmentFileUrl,
                    type: getImageMimeType(assignmentFileUrl),
                    name: "Assignment File",
                  }}
                />
              ) : (
                <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">
                      {assignmentFileUrl.split("/").pop()?.split("?")[0] || "Assignment file"}
                    </span>
                  </div>
                  <a href={assignmentFileUrl} download target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          ) : null}

          {assignment?.submission ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Your Submission</h4>
              <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(getAssignmentStatus(assignment))}>
                    {getStatusLabel(getAssignmentStatus(assignment))}
                  </Badge>
                  {assignment.submission.reviewStatus === "completed" ? (
                    <Badge className="bg-green-600 text-white">
                      +{assignment.rewardPoints ?? 0} point{(assignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                    </Badge>
                  ) : null}
                </div>

                {assignment.submission.content ? (
                  <p className="text-sm text-muted-foreground">{assignment.submission.content}</p>
                ) : null}

                {assignment.submission.filePath ? (
                  isImageFile(submissionFileUrl) ? (
                    <ChatImagePreview
                      attachment={{
                        url: submissionFileUrl,
                        type: getImageMimeType(submissionFileUrl),
                        name: "Submitted File",
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between rounded-md bg-background/50 p-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm">
                          {submissionFileUrl.split("/").pop()?.split("?")[0] || "Submitted file"}
                        </span>
                      </div>
                      <a href={submissionFileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  )
                ) : null}

                <p className="text-xs text-muted-foreground">
                  Submitted: {fmtDate(assignment.submission.submittedAt)}
                </p>

                {assignment.submission.reviewRemark ? (
                  <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-3">
                    <p className="mb-1 text-sm font-medium text-foreground">Teacher remark</p>
                    <p className="text-sm text-muted-foreground">{assignment.submission.reviewRemark}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
