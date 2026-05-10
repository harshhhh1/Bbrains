"use client";

import { DashboardContent } from "@/components/dashboard-content";
import { ClassFormDrawer } from "@/features/manager/classes/ui/ClassFormDrawer";
import { ClassesHeader } from "@/features/manager/classes/ui/ClassesHeader";
import { ClassesList } from "@/features/manager/classes/ui/ClassesList";
import { ClassPreview } from "@/features/manager/classes/ui/ClassPreview";

import { useManagerClassesPage } from "@/features/manager/classes/model/use-manager-classes";

export default function ManagerClassesPage() {
  const page = useManagerClassesPage();

  return (
    <DashboardContent className="space-y-6">
      <ClassesHeader onCreate={page.openCreateDialog} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ClassesList
          loading={page.loading}
          search={page.search}
          selectedClassId={page.selectedClass?.id || null}
          filteredClasses={page.filteredClasses}
          onSearchChange={page.setSearch}
          onSelectClass={page.setSelectedClassId}
          onEditDetails={(course) => page.openEditDialog(course)}
          onEditTimetable={(course) => page.openEditDialog(course, true)}
          onDelete={page.handleDelete}
        />

        <ClassPreview selectedClass={page.selectedClass} />
      </div>

      <ClassFormDrawer
        open={page.dialogOpen}
        onOpenChange={page.setDialogOpen}
        timetableDialogOpen={page.timetableDialogOpen}
        onTimetableDialogOpenChange={page.setTimetableDialogOpen}
        editingClassId={page.editingClassId}
        submitting={page.submitting}
        form={page.form}
        subjectSuggestions={page.subjectSuggestions}
        timetableSummary={page.timetableSummary}
        setForm={page.setForm}
        onSubmit={page.handleSubmit}
        onTimetableSave={page.handleTimetableSave}
        addSemester={page.addSemester}
        removeSemester={page.removeSemester}
        addSubjectToSemester={page.addSubjectToSemester}
        removeSubjectFromSemester={page.removeSubjectFromSemester}
        updateSubjectInSemetable={page.updateSubjectInSemester}
      />

    </DashboardContent>
  );
}
