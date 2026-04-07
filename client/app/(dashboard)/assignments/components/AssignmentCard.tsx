"use client"

import React from "react"
import { Calendar, Eye, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Assignment } from "@/services/api/client"
import { fmtDate, getStatusBadgeVariant } from "../utils"

interface AssignmentCardProps {
  assignment: Assignment
  isPrevious: boolean
  setViewAssignment: (a: Assignment) => void
  setSubmitAssignment: (a: Assignment) => void
}

export function AssignmentCard({
  assignment,
  isPrevious,
  setViewAssignment,
  setSubmitAssignment,
}: AssignmentCardProps) {
  return (
    <Card className={`border-border/60 ${isPrevious ? "opacity-80" : ""}`}>
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{assignment.course?.name || "General"}</Badge>
            <Badge variant={getStatusBadgeVariant(assignment.status)}>
              {assignment.status || "incomplete"}
            </Badge>
            {assignment.grade && (
              <Badge variant="default" className="bg-green-600 text-white">
                Grade: {assignment.grade.grade}
              </Badge>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{assignment.title}</p>
            <p className="text-sm text-muted-foreground">
              {assignment.description || "No description provided."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Due {fmtDate(assignment.dueDate)}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setViewAssignment(assignment)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          {!assignment.submission && !isPrevious && (
            <Button
              className="rounded-2xl"
              onClick={() => setSubmitAssignment(assignment)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
