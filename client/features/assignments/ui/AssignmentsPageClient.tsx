"use client"

import { PageContainer, PageHeader } from "@/components/layout/page-primitives"
import { LoadingState } from "@/components/ui/loading-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      <PageContainer>
        <LoadingState label="Loading assignments..." className="py-8" iconClassName="size-4" />
      </PageContainer>
    )
  }

  // Admin / Manager / Teacher View (Management Hub)
  if (userRole === "admin" || userRole === "superadmin" || userRole === "manager" || userRole === "teacher") {
    return (
      <PageContainer>
        <Tabs defaultValue="manage" className="flex-col space-y-6">
          <PageHeader
            title="Assignments Hub"
            description="Manage institutional assignments, review submissions, and publish results."
            actions={
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
            }
          />
        
        <TabsContent value="manage" className="mt-0 border-none p-0 outline-none">
          <AssignmentsAdminView />
        </TabsContent>
        
        <TabsContent value="review" className="mt-0 border-none p-0 outline-none">
          <TeacherGradingView />
        </TabsContent>
      </Tabs>

      </PageContainer>
    )
  }

  return (
    <PageContainer>
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
    </PageContainer>
  )
}
