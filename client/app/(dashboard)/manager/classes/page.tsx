"use client";

import { DashboardContent } from "@/components/dashboard-content";
import { ClassFormDrawer } from "./components/ClassFormDrawer";
import { ClassesHeader } from "./components/ClassesHeader";
import { ClassesList } from "./components/ClassesList";
import { ClassPreview } from "./components/ClassPreview";
import { ClassStatsGrid } from "./components/ClassStatsGrid";
import { useManagerClassesPage } from "./hooks/use-manager-classes";

export default function ManagerClassesPage() {
  const page = useManagerClassesPage();

  return (
    <DashboardContent className="space-y-6">
      <ClassesHeader onCreate={page.openCreateDialog} />

      <ClassStatsGrid classes={page.classes} />

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
      />
    </DashboardContent>
  );
}
