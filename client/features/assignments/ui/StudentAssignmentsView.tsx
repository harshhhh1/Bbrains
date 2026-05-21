"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/loading-state"
import { PageHeader, Stack } from "@/components/layout/page-primitives"
import { SearchField } from "@/components/ui/toolbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignmentCard } from "@/features/assignments/ui/AssignmentCard"
import type { Assignment } from "@/services/api/client"
import { StudentAssignmentFilter } from "@/features/assignments/types"

interface StudentAssignmentsViewProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeFilter: StudentAssignmentFilter
  setActiveFilter: (filter: StudentAssignmentFilter) => void
  counts: { all: number; pending: number; completed: number }
  loading: boolean
  filteredAssignments: Assignment[]
  onViewAssignment: (assignment: Assignment) => void
  onSubmitAssignment: (assignment: Assignment) => void
}

export function StudentAssignmentsView({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  counts,
  loading,
  filteredAssignments,
  onViewAssignment,
  onSubmitAssignment,
}: StudentAssignmentsViewProps) {
  return (
    <>
      <PageHeader
        title="Assignments"
        description="Submit classwork, track what is still pending, and see when a teacher has approved it."
        actions={
          <SearchField
            wrapperClassName="max-w-md"
            className="rounded-2xl"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        }
      />

      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as StudentAssignmentFilter)} className="flex flex-col space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          {loading ? (
            <LoadingState label="Loading assignments..." className="py-8" iconClassName="size-4" />
          ) : filteredAssignments.length === 0 ? (
            <EmptyState title="No assignments matched this filter." className="py-10" />
          ) : (
            <Stack>
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onView={onViewAssignment}
                  onSubmit={onSubmitAssignment}
                />
              ))}
            </Stack>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
