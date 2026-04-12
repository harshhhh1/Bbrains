"use client"

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"
import { AssignmentCard } from "./AssignmentCard"
import type { Assignment } from "@/services/api/client"
import { StudentAssignmentFilter } from "../types"

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">
            Submit classwork, track what is still pending, and see when a teacher has approved it.
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-2xl pl-9"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as StudentAssignmentFilter)} className="flex flex-col space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading assignments...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <Card className="border-dashed border-border/70">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No assignments matched this filter.
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={onViewAssignment}
                onSubmit={onSubmitAssignment}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
