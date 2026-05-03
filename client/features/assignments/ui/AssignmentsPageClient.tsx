"use client"

import { DashboardContent } from "@/components/dashboard-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { TeacherGradingView } from "@/features/grading/ui/TeacherGradingView"
import { AssignmentsAdminView } from "@/features/assignments/ui/AssignmentsAdminView"
import { useAssignments } from "@/features/assignments/model/use-assignments"
import { StudentAssignmentsView } from "@/features/assignments/ui/StudentAssignmentsView"
import { AssignmentViewDialog } from "@/features/assignments/ui/AssignmentViewDialog"
import { AssignmentSubmitDrawer } from "@/features/assignments/ui/AssignmentSubmitDrawer"
import { BookOpen, ListChecks } from "lucide-react"


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

  // Admin / Manager / Teacher View (Management Hub)
  if (userRole === "admin" || userRole === "superadmin" || userRole === "manager" || userRole === "teacher") {
    return (
      <DashboardContent className="space-y-6">
        <Tabs defaultValue="manage" className="flex-col space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assignments Hub</h1>
              <p className="text-muted-foreground text-sm">
                Manage institutional assignments, review submissions, and publish results.
              </p>
            </div>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="manage" className="gap-2">
              <BookOpen className="size-3.5" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2">
              <ListChecks className="size-3.5" />
              Review
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="manage" className="mt-0 border-none p-0 outline-none">
          <AssignmentsAdminView />
        </TabsContent>
        
        <TabsContent value="review" className="mt-0 border-none p-0 outline-none">
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
