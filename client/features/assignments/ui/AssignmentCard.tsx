"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Eye, RotateCcw, Upload } from "lucide-react"
import type { Assignment } from "@/services/api/client"
import {
  canSubmitAssignment,
  fmtDate,
  getAssignmentStatus,
  getStatusBadgeVariant,
  getStatusLabel,
} from "@/features/assignments/model"

interface AssignmentCardProps {
  assignment: Assignment
  onView: (assignment: Assignment) => void
  onSubmit: (assignment: Assignment) => void
}

export function AssignmentCard({ assignment, onView, onSubmit }: AssignmentCardProps) {
  const status = getAssignmentStatus(assignment)
  const canSubmit = canSubmitAssignment(assignment)

  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{assignment.course?.name || "General"}</Badge>
            <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
            <Badge variant="outline">
              {assignment.rewardPoints ?? 0} point{(assignment.rewardPoints ?? 0) === 1 ? "" : "s"}
            </Badge>
          </div>

          <div>
            <p className="font-semibold text-foreground">{assignment.title}</p>
            <p className="text-sm text-muted-foreground">
              {assignment.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Due {fmtDate(assignment.dueDate)}
            </span>
            {assignment.submission?.submittedAt ? (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Submitted {fmtDate(assignment.submission.submittedAt)}
              </span>
            ) : null}
          </div>

          {assignment.submission?.reviewRemark ? (
            <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm">
              <p className="mb-1 font-medium text-foreground">Teacher remark</p>
              <p className="text-muted-foreground">{assignment.submission.reviewRemark}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={() => onView(assignment)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          {canSubmit ? (
            <Button className="rounded-2xl" onClick={() => onSubmit(assignment)}>
              {assignment.submission?.reviewStatus === "rework" ? (
                <RotateCcw className="mr-2 h-4 w-4" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {assignment.submission?.reviewStatus === "rework" ? "Resubmit" : "Submit Work"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
