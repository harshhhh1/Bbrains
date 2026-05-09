"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { FileText, Loader2, RotateCcw, Upload, X } from "lucide-react"
import { getImageMimeType, isImageFile } from "@/features/assignments/model"
import type { Assignment } from "@/services/api/client"
import { toast } from "sonner"
import { assignmentApi } from "@/services/api/client"
import React, { useState, useEffect } from "react"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { useNotifications } from "@/components/providers/notification-provider"

interface AssignmentSubmitDrawerProps {
  assignment: Assignment | null
  onClose: () => void
  onSuccess: () => Promise<void>
}

export function AssignmentSubmitDrawer({
  assignment,
  onClose,
  onSuccess,
}: AssignmentSubmitDrawerProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submissionComment, setSubmissionComment] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  const { uploadFile } = useCloudinaryUpload()
  const { registerIncomingAssignmentNotification } = useNotifications()

  useEffect(() => {
    if (assignment) {
      setSelectedFile(null)
      setFilePreviewUrl(null)
      setSubmissionComment(assignment.submission?.reviewStatus === "rework" ? assignment.submission.reviewRemark ?? "" : "")
    }
  }, [assignment])

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    if (isImageFile(file.name)) {
      setFilePreviewUrl(URL.createObjectURL(file))
      return
    }

    setFilePreviewUrl(null)
  }

  async function handleFileSubmit() {
    if (!selectedFile || !assignment) return

    setSubmitting(true)
    const loadingToast = toast.loading(
      assignment.submission?.reviewStatus === "rework"
        ? "Uploading your updated submission..."
        : "Uploading your assignment..."
    )

    try {
      const fileUrl = await uploadFile(selectedFile, { folder: "assignment" })
      if (!fileUrl) {
        throw new Error("Upload failed")
      }

      const payload = {
        assignmentId: assignment.id,
        content: submissionComment.trim() || `Submitted file: ${selectedFile.name}`,
        fileUrl,
      }

      const response = await assignmentApi.submitAssignment(payload)
      if (!response.success) {
        throw new Error(response.message || "Submission failed")
      }

      toast.success(
        assignment.submission?.reviewStatus === "rework"
          ? "Assignment resubmitted successfully"
          : "Assignment submitted successfully",
        { id: loadingToast }
      )

      onClose()
      window.dispatchEvent(new Event("user-xp-updated"));
      await onSuccess()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Submission failed", { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      direction="right"
      open={!!assignment}
      onOpenChange={(open) => {
        if (!open && !submitting) {
          onClose()
        }
      }}
    >
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-xl font-bold">
                  {assignment?.submission?.reviewStatus === "rework" ? "Resubmit Assignment" : "Submit Assignment"}
                </DrawerTitle>
                <DrawerDescription>
                  Upload your work for{" "}
                  <span className="font-semibold text-foreground">{assignment?.title}</span>.
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
            {assignment?.submission?.reviewRemark ? (
              <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 text-sm dark:border-orange-900 dark:bg-orange-950/20">
                <p className="mb-1 font-medium text-foreground">Teacher remark</p>
                <p className="text-muted-foreground">{assignment.submission.reviewRemark}</p>
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium">Submission Note (Optional)</label>
              <Textarea
                placeholder="Add a short note for the teacher..."
                value={submissionComment}
                onChange={(event) => setSubmissionComment(event.target.value)}
                className="mt-2 rounded-xl"
                rows={4}
                disabled={submitting}
              />
            </div>

            <label
              htmlFor="assignment-file"
              className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-border/70 p-6 text-center transition hover:border-brand-orange/40 hover:bg-brand-orange/5"
            >
              <FileText className="mb-3 h-8 w-8 text-brand-orange" />
              <p className="text-sm font-medium text-foreground">Click to choose a file</p>
              {selectedFile ? (
                <p className="mt-1 text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
              ) : (
                <p className="text-xs text-muted-foreground">PDF, image, document, or archive formats all work here.</p>
              )}
              <input id="assignment-file" type="file" className="hidden" onChange={handleFileSelect} disabled={submitting} />
            </label>

            {filePreviewUrl && selectedFile ? (
              <ChatImagePreview
                attachment={{
                  url: filePreviewUrl,
                  type: getImageMimeType(selectedFile.name),
                  name: selectedFile.name,
                }}
              />
            ) : null}

            {submitting ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading your file...
              </div>
            ) : null}
          </div>

          <DrawerFooter className="border-t border-border/60 bg-background/95 p-6 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="ghost" disabled={submitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button className="rounded-2xl" onClick={handleFileSubmit} disabled={!selectedFile || submitting}>
              {assignment?.submission?.reviewStatus === "rework" ? (
                <RotateCcw className="mr-2 h-4 w-4" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {submitting
                ? "Submitting..."
                : assignment?.submission?.reviewStatus === "rework"
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
