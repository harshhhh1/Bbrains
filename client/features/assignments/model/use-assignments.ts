"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { assignmentApi, dashboardApi, type Assignment } from "@/services/api/client"
import { toast } from "sonner"
import { getAssignmentStatus } from "@/features/assignments/model"
import { StudentAssignmentFilter } from "@/features/assignments/types"

export function useAssignments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<StudentAssignmentFilter>("pending")
  const [submitAssignmentTarget, setSubmitAssignmentTarget] = useState<Assignment | null>(null)
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const [userResponse, assignmentResponse, submissionsResponse] = await Promise.all([
        dashboardApi.getUser(),
        assignmentApi.getAssignments(),
        assignmentApi.getMySubmissions(),
      ])

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type)
      }

      if (assignmentResponse.success && assignmentResponse.data) {
        const submissions = submissionsResponse.success && submissionsResponse.data ? submissionsResponse.data : []
        const submissionsMap = new Map(submissions.map((submission) => [submission.assignmentId, submission]))

        setAssignments(
          assignmentResponse.data.map((assignment) => {
            const submission = submissionsMap.get(assignment.id)
            return {
              ...assignment,
              rewardPoints: assignment.rewardPoints ?? 0,
              submission,
              status: getAssignmentStatus({
                ...assignment,
                submission,
              }),
            }
          })
        )
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load your assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAssignments()
  }, [loadAssignments])

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return assignments.filter((assignment) => {
      const status = getAssignmentStatus(assignment)
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "completed"
            ? status === "completed"
            : status !== "completed"

      if (!matchesFilter) return false
      if (!query) return true

      return (
        assignment.title.toLowerCase().includes(query) ||
        (assignment.course?.name?.toLowerCase() || "").includes(query) ||
        (assignment.description?.toLowerCase() || "").includes(query)
      )
    })
  }, [activeFilter, assignments, searchQuery])

  const counts = useMemo(
    () => ({
      all: assignments.length,
      pending: assignments.filter((assignment) => getAssignmentStatus(assignment) !== "completed").length,
      completed: assignments.filter((assignment) => getAssignmentStatus(assignment) === "completed").length,
    }),
    [assignments]
  )

  return {
    searchQuery,
    setSearchQuery,
    userRole,
    assignments,
    loading,
    activeFilter,
    setActiveFilter,
    submitAssignmentTarget,
    setSubmitAssignmentTarget,
    viewAssignment,
    setViewAssignment,
    loadAssignments,
    filteredAssignments,
    counts,
  }
}
