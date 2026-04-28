"use client"

import { useState } from "react"
import { Check, Loader2, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ReviewStatus = "completed" | "incomplete" | "rework"

interface GradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  existingStatus?: "completed" | "incomplete" | "rework" | "submitted"
  existingRemark?: string | null
  onSubmit: (payload: { reviewStatus: ReviewStatus; reviewRemark?: string }) => Promise<boolean>
  submitting: boolean
}

export function GradeDialog({
  open,
  onOpenChange,
  studentName,
  existingStatus,
  existingRemark,
  onSubmit,
  submitting,
}: GradeDialogProps) {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    () => (existingStatus === "rework" ? "rework" : existingStatus === "incomplete" ? "incomplete" : "completed")
  )
  const [reviewRemark, setReviewRemark] = useState(() => existingRemark ?? "")

  async function handleSubmit() {
    const success = await onSubmit({
      reviewStatus,
      reviewRemark: reviewRemark.trim() || undefined,
    })

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Review Submission</DialogTitle>
          <DialogDescription>
            Mark {studentName}&apos;s submission as completed, rework, or incomplete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Review Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={reviewStatus === "completed" ? "default" : "outline"}
                className={`flex-1 gap-2 ${reviewStatus === "completed" ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => setReviewStatus("completed")}
                disabled={submitting}
              >
                <Check className="h-4 w-4" />
                Complete
              </Button>
              <Button
                type="button"
                variant={reviewStatus === "rework" ? "default" : "outline"}
                className={`flex-1 gap-2 ${reviewStatus === "rework" ? "bg-brand-orange hover:bg-brand-orange/90" : ""}`}
                onClick={() => setReviewStatus("rework")}
                disabled={submitting}
              >
                <RotateCcw className="h-4 w-4" />
                Rework
              </Button>
              <Button
                type="button"
                variant={reviewStatus === "incomplete" ? "default" : "outline"}
                className={`flex-1 gap-2 ${reviewStatus === "incomplete" ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={() => setReviewStatus("incomplete")}
                disabled={submitting}
              >
                <X className="h-4 w-4" />
                Incomplete
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-remark">Remark (Optional)</Label>
            <Textarea
              id="review-remark"
              value={reviewRemark}
              onChange={(event) => setReviewRemark(event.target.value)}
              placeholder={
                reviewStatus === "completed"
                  ? "Nice work. Add any note the student should see."
                  : reviewStatus === "rework"
                    ? "Explain what needs to be fixed before resubmitting."
                    : "Optional note (this assignment cannot be resubmitted)."
              }
              rows={4}
              maxLength={255}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
