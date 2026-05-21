"use client";

import { PageContainer } from "@/components/layout/page-primitives";
import { Toolbar } from "@/components/ui/toolbar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AcademicsControls } from "@/features/academics/ui/AcademicsControls";
import { AcademicsHeader } from "@/features/academics/ui/AcademicsHeader";
import { AcademicsLoadingState } from "@/features/academics/ui/AcademicsLoadingState";
import { CoursesTable } from "@/features/academics/ui/CoursesTable";
import { DeleteDialog } from "@/features/academics/ui/DeleteDialog";
import { CourseFormModal } from "@/features/academics/course-form";
import { useAcademics } from "@/features/academics/model/use-academics";
import { BulkEnrollmentModal } from "@/features/academics/ui/BulkEnrollmentModal";


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
    loading,
    canCreateCourse,
    canManageCourse,
    handleAddClick,
    handleEditClick,
    handleDelete,
    courseModalOpen,
    setCourseModalOpen,
    onCourseCreated,
    handleEnrollClick,
    enrollmentModalOpen,
    setEnrollmentModalOpen,
    selectedCourse,
    fetchData: refreshData,
  } = useAcademics();


  if (loading && courses.length === 0) {
    return <AcademicsLoadingState />;
  }

  return (
    <PageContainer>
      <AcademicsHeader />


      <Tabs value={tab} onValueChange={setTab} className="flex-col gap-4">
        <Toolbar className="bg-card/70 p-3 md:p-4">
          <AcademicsControls
            tab={tab}
            search={search}
            onSearchChange={setSearch}
            onAddClick={handleAddClick}
            canAdd={canCreateCourse || canManageCourse}
          />
        </Toolbar>

        <TabsContent value="courses" className="mt-0 pt-2">
          <CoursesTable
            courses={courses}
            search={search}
            onDelete={setDeleteId}
            onEdit={canManageCourse ? handleEditClick : undefined}
            onEnroll={canManageCourse ? handleEnrollClick : undefined}
          />
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

      <BulkEnrollmentModal
        open={enrollmentModalOpen}
        onOpenChange={setEnrollmentModalOpen}
        course={selectedCourse}
        onSuccess={refreshData}
      />
    </PageContainer>

  );
}

