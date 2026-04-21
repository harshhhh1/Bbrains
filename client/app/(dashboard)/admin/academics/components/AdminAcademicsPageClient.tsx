"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AcademicsControls } from "./AcademicsControls";
import { AcademicsHeader } from "./AcademicsHeader";
import { AcademicsLoadingState } from "./AcademicsLoadingState";
import { CoursesTable } from "./CoursesTable";
import { StudentsTable } from "./StudentsTable";
import { AssignmentsTable } from "./AssignmentsTable";
import { DeleteDialog } from "./DeleteDialog";
import { CourseFormModal } from "./CourseFormModal";
import { useAcademics } from "../hooks/use-academics";

export default function AcademicsPage() {
  const {
    tab,
    setTab,
    search,
    setSearch,
    deleteId,
    setDeleteId,
    deleting,
    courses,
    students,
    assignments,
    loading,
    canCreateCourse,
    canManageCourse,
    handleAddClick,
    handleEditClick,
    handleDelete,
    courseModalOpen,
    setCourseModalOpen,
    onCourseCreated,
  } = useAcademics();

  if (loading && courses.length === 0) {
    return <AcademicsLoadingState />;
  }

  return (
    <div className="space-y-6">
      <AcademicsHeader
        coursesCount={courses.length}
        studentsCount={students.length}
        assignmentsCount={assignments.length}
      />

      <Tabs value={tab} onValueChange={setTab} className="flex-col gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-3 md:p-4">
          <AcademicsControls
            tab={tab}
            search={search}
            onSearchChange={setSearch}
            onAddClick={handleAddClick}
            canAdd={canCreateCourse || canManageCourse}
          />
        </div>

        <TabsContent value="courses" className="mt-0">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
            <CardContent className="p-0">
              <CoursesTable
                courses={courses}
                search={search}
                onDelete={setDeleteId}
                onEdit={canManageCourse ? handleEditClick : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
            <CardContent className="p-0">
              <StudentsTable students={students} search={search} onDelete={(id) => setDeleteId(id)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-0">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
            <CardContent className="p-0">
              <AssignmentsTable assignments={assignments} search={search} onDelete={(id) => setDeleteId(id)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteDialog
        deleteId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        confirming={deleting}
      />

      <CourseFormModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        onSuccess={onCourseCreated}
      />
    </div>
  );
}
