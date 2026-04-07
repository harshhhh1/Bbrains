import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { assignmentApi, dashboardApi, gradeApi, type Assignment } from "@/services/api/client"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"

export function useAssignments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitAssignment, setSubmitAssignment] = useState<Assignment | null>(null)
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)
  const [submissionComment, setSubmissionComment] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  const { uploadFile } = useCloudinaryUpload()

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const [userResponse, assignmentResponse, gradesResponse, submissionsResponse] = await Promise.all([
        dashboardApi.getUser(),
        assignmentApi.getAssignments(),
        gradeApi.getMyGrades(),
        assignmentApi.getMySubmissions(),
      ])

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type)
      }

      if (assignmentResponse.success && assignmentResponse.data) {
        let enrichedAssignments = assignmentResponse.data

        const gradesMap = gradesResponse.success && gradesResponse.data
          ? new Map(gradesResponse.data.map((g) => [g.assignmentId, g]))
          : new Map()

        const submissionsMap = submissionsResponse.success && submissionsResponse.data
          ? new Map(submissionsResponse.data.map((s) => [s.assignmentId, s]))
          : new Map()

        enrichedAssignments = enrichedAssignments.map((a) => {
          const hasGrade = gradesMap.has(a.id)
          const hasSubmission = submissionsMap.has(a.id)

          return {
            ...a,
            status: hasGrade ? "graded" : hasSubmission ? "submitted" : "pending",
            submission: submissionsMap.get(a.id) || null,
            grade: gradesMap.get(a.id) || null,
          }
        })

        setAssignments(enrichedAssignments)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [assignments, searchQuery])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      setSelectedFile(file)

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        setFilePreviewUrl(url)
      } else {
        setFilePreviewUrl(null)
      }
    }
  }

  const clearFileSelection = () => {
    setSelectedFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
  }

  const handleSubmit = async () => {
    if (!submitAssignment) return

    try {
      setSubmitting(true)
      let fileUrl = null

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile)
      }

      const response = await assignmentApi.submitAssignment({
        assignmentId: submitAssignment.id,
        content: submissionComment,
        fileUrl,
      })

      if (response.success) {
        toast.success("Assignment submitted successfully")
        setSubmitAssignment(null)
        setSubmissionComment("")
        clearFileSelection()
        await loadAssignments()
      } else {
        toast.error(response.error || "Failed to submit assignment")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit assignment")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    userRole,
    assignments,
    loading,
    submitting,
    submitAssignment,
    setSubmitAssignment,
    viewAssignment,
    setViewAssignment,
    submissionComment,
    setSubmissionComment,
    selectedFile,
    filePreviewUrl,
    handleFileSelect,
    clearFileSelection,
    handleSubmit,
    filteredAssignments,
  }
}
