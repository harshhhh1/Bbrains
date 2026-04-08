"use client"

import { DashboardContent } from "@/components/dashboard-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { TeacherAssignmentManager } from "@/features/assignments/components/TeacherAssignmentManager"
import { TeacherGradingView } from "@/features/grading/components/TeacherGradingView"
import { useAssignments } from "./hooks/use-assignments"
import { StudentAssignmentsView } from "./components/StudentAssignmentsView"
import { AssignmentViewDialog } from "./components/AssignmentViewDialog"
import { AssignmentSubmitDrawer } from "./components/AssignmentSubmitDrawer"

export default function AssignmentsPage() {
  const {
    searchQuery,
    setSearchQuery,
    userRole,
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
  } = useAssignments()

  if (loading && !userRole) {
    return (
      <DashboardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assignments...
        </div>
      </DashboardContent>
    )
  }

  if (userRole === "teacher") {
    return (
      <DashboardContent className="space-y-6">
        <Tabs defaultValue="manage" className="flex-col space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
              <p className="text-muted-foreground">
                Create assignments, review uploaded work, and approve completed submissions.
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="manage">Manage</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="manage">
            <TeacherAssignmentManager />
          </TabsContent>
          <TabsContent value="review">
            <TeacherGradingView />
          </TabsContent>
        </Tabs>
      </DashboardContent>
    )
  }

  return (
    <DashboardContent className="space-y-6">
      <StudentAssignmentsView
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        counts={counts}
        loading={loading}
        filteredAssignments={filteredAssignments}
        onViewAssignment={setViewAssignment}
        onSubmitAssignment={setSubmitAssignmentTarget}
      />

      <AssignmentViewDialog
        assignment={viewAssignment}
        onClose={() => setViewAssignment(null)}
      />

      <AssignmentSubmitDrawer
        assignment={submitAssignmentTarget}
        onClose={() => setSubmitAssignmentTarget(null)}
        onSuccess={loadAssignments}
      />
    </DashboardContent>
  )
}
