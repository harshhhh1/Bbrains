"use client"

import { Button } from "@/components/ui/button"
import { DrawerClose } from "@/components/ui/drawer"
import { DrawerShell } from "@/components/ui/drawer-shell"
import { Textarea } from "@/components/ui/textarea"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { FileText, Loader2, RotateCcw, Upload } from "lucide-react"
import { getImageMimeType, isImageFile } from "@/features/assignments/model"
import type { Assignment } from "@/services/api/client"
import { toast } from "sonner"
import { assignmentApi } from "@/services/api/client"
import React, { useState, useEffect } from "react"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"

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
    <DrawerShell
      open={!!assignment}
      onOpenChange={(open) => {
        if (!open && !submitting) {
          onClose()
        }
      }}
      width="md"
      title={assignment?.submission?.reviewStatus === "rework" ? "Resubmit Assignment" : "Submit Assignment"}
      description={
        <>
          Upload your work for{" "}
          <span className="font-semibold text-foreground">{assignment?.title}</span>.
        </>
      }
      bodyClassName="space-y-4"
      footer={
        <>
          <DrawerClose asChild>
            <Button variant="ghost" disabled={submitting}>
              Cancel
            </Button>
          </DrawerClose>
          <Button className="rounded-2xl" onClick={handleFileSubmit} disabled={!selectedFile || submitting}>
            {assignment?.submission?.reviewStatus === "rework" ? (
              <RotateCcw className="mr-2 size-4" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {submitting
              ? "Submitting..."
              : assignment?.submission?.reviewStatus === "rework"
                ? "Resubmit Assignment"
                : "Submit Assignment"}
          </Button>
        </>
      }
      footerClassName="bg-background/95"
    >
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
    </DrawerShell>
  )
}
