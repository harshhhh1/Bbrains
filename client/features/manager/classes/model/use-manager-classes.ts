"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { courseApi, type ClassTimetableEntry, type Course } from "@/services/api/client";
import { emptyForm, parseSubjects, summarizeTimetable } from "@/features/manager/classes/model/classes";
import type { ClassFormState } from "@/features/manager/classes/types/classes";

export function useManagerClassesPage() {
  const [classes, setClasses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingClassId, setEditingClassId] = useState<Course["id"] | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<Course["id"] | null>(null);
  const [form, setForm] = useState<ClassFormState>(emptyForm);

  useEffect(() => {
    let mounted = true;

    async function loadClasses() {
      try {
        setLoading(true);
        const response = await courseApi.getCourses();
        if (!mounted) return;

        if (response.success) {
          const nextClasses = response.data || [];
          setClasses(nextClasses);
          setSelectedClassId((current) => current || nextClasses[0]?.id || null);
        } else {
          toast.error(response.message || "Failed to load classes");
        }
      } catch (error) {
        console.error(error);
        if (mounted) toast.error("Failed to load classes");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadClasses();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredClasses = useMemo(() => {
    const query = search.toLowerCase();
    return classes.filter((course) => {
      if (!query) return true;
      return (
        course.name.toLowerCase().includes(query) ||
        (course.standard || "").toLowerCase().includes(query) ||
        (course.subjects || []).some((subject) => subject.toLowerCase().includes(query))
      );
    });
  }, [classes, search]);

  const selectedClass =
    filteredClasses.find((course) => course.id === selectedClassId) ||
    classes.find((course) => course.id === selectedClassId) ||
    null;

  const subjectSuggestions = useMemo(() => parseSubjects(form.subjectsText), [form.subjectsText]);
  const timetableSummary = useMemo(() => summarizeTimetable(form.timetable), [form.timetable]);

  function openCreateDialog() {
    setEditingClassId(null);
    setForm(emptyForm);
    setTimetableDialogOpen(false);
    setDialogOpen(true);
  }

  function openEditDialog(course: Course, openTimetable = false) {
    setEditingClassId(course.id);
    setForm({
      name: course.name,
      description: course.description || "",
      standard: course.standard || "",
      subjectsText: (course.subjects || []).join("\n"),
      feePerStudent: course.feePerStudent ? String(course.feePerStudent) : "",
      durationValue: course.durationValue ? String(course.durationValue) : "",
      durationUnit: course.durationUnit || "months",
      studentCapacity: course.studentCapacity ? String(course.studentCapacity) : "",
      timetable: course.timetable?.length ? course.timetable : [],
      semesters: course.semesters?.length
        ? course.semesters.map((sem) => ({
            id: String(sem.id || Math.random()),
            semesterNumber: sem.semesterNumber,
            subjects: sem.subjects.map((sub) => ({
              id: String(sub.id || Math.random()),
              name: sub.name,
              code: sub.code,
              examTotalMarks: sub.examTotalMarks,
            })),
          }))
        : [{ id: "1", semesterNumber: 1, subjects: [{ id: "1", name: "", code: "", examTotalMarks: 100 }] }],
    });

    setDialogOpen(true);
    setTimetableDialogOpen(openTimetable);
  }

  function handleTimetableSave(timetable: ClassTimetableEntry[]) {
    setForm((current) => ({
      ...current,
      timetable,
    }));
    toast.success("Timetable assigned to this class");
  }

  function addSemester() {
    setForm((current) => {
      const nextNum = current.semesters.length + 1;
      return {
        ...current,
        semesters: [
          ...current.semesters,
          {
            id: Math.random().toString(36).substr(2, 9),
            semesterNumber: nextNum,
            subjects: [{ id: Math.random().toString(36).substr(2, 9), name: "", code: "", examTotalMarks: 100 }],
          },
        ],
      };
    });
  }

  function removeSemester(semesterId: string) {
    setForm((current) => ({
      ...current,
      semesters: current.semesters.filter((s) => s.id !== semesterId),
    }));
  }

  function addSubjectToSemester(semesterId: string) {
    setForm((current) => ({
      ...current,
      semesters: current.semesters.map((sem) =>
        sem.id === semesterId
          ? {
              ...sem,
              subjects: [
                ...sem.subjects,
                { id: Math.random().toString(36).substr(2, 9), name: "", code: "", examTotalMarks: 100 },
              ],
            }
          : sem
      ),
    }));
  }

  function removeSubjectFromSemester(semesterId: string, subjectId: string) {
    setForm((current) => ({
      ...current,
      semesters: current.semesters.map((sem) =>
        sem.id === semesterId ? { ...sem, subjects: sem.subjects.filter((sub) => sub.id !== subjectId) } : sem
      ),
    }));
  }

  function updateSubjectInSemester(
    semesterId: string,
    subjectId: string,
    field: string,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      semesters: current.semesters.map((sem) =>
        sem.id === semesterId
          ? {
              ...sem,
              subjects: sem.subjects.map((sub) => (sub.id === subjectId ? { ...sub, [field]: value } : sub)),
            }
          : sem
      ),
    }));
  }


  async function handleSubmit() {
    const subjects = parseSubjects(form.subjectsText);
    const timetable = form.timetable.filter(
      (entry) => entry.subject.trim() && entry.day && entry.startTime && entry.endTime
    );

    if (!form.name.trim() || !form.standard.trim()) {
      toast.error("Class name and standard are required");
      return;
    }
    if (subjects.length === 0) {
      toast.error("Add at least one subject");
      return;
    }
    if (timetable.length === 0) {
      toast.error("Add at least one timetable entry");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      standard: form.standard.trim(),
      subjects,
      feePerStudent: form.feePerStudent ? Number(form.feePerStudent) : undefined,
      durationValue: form.durationValue ? Number(form.durationValue) : undefined,
      durationUnit: form.durationUnit,
      studentCapacity: form.studentCapacity ? Number(form.studentCapacity) : undefined,
      timetable: timetable.map((entry) => ({
        ...entry,
        subject: entry.subject.trim(),
        room: entry.room?.trim() || null,
      })),
      semesters: form.semesters.map((sem) => ({
        semesterNumber: sem.semesterNumber,
        subjects: sem.subjects
          .filter((sub) => sub.name.trim() && sub.code.trim())
          .map((sub) => ({
            name: sub.name.trim(),
            code: sub.code.trim().toUpperCase(),
            examTotalMarks: Number(sub.examTotalMarks) || 100,
          })),
      })).filter(sem => sem.subjects.length > 0),
    };


    if (payload.feePerStudent !== undefined && payload.feePerStudent < 0) {
      toast.error("Fee per student cannot be negative");
      return;
    }
    if (payload.durationValue !== undefined && payload.durationValue <= 0) {
      toast.error("Duration must be a positive number");
      return;
    }
    if (payload.studentCapacity !== undefined && payload.studentCapacity <= 0) {
      toast.error("Student capacity must be at least 1");
      return;
    }

    try {
      setSubmitting(true);
      const response = editingClassId
        ? await courseApi.updateCourse(editingClassId, payload)
        : await courseApi.createCourse(payload);

      if (!response.success || !response.data) {
        if (response.errors && Array.isArray(response.errors)) {
          console.table(response.errors);
          response.errors.forEach((err: any) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(response.message || "Failed to save class");
        }
        return;
      }

      const savedClass = response.data;
      setClasses((current) =>
        editingClassId ? current.map((course) => (course.id === editingClassId ? savedClass : course)) : [savedClass, ...current]
      );
      setSelectedClassId(savedClass.id);
      setTimetableDialogOpen(false);
      setDialogOpen(false);
      toast.success(editingClassId ? "Class updated" : "Class created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save class");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(courseId: Course["id"]) {
    try {
      const response = await courseApi.deleteCourse(courseId);
      if (!response.success) {
        toast.error(response.message || "Failed to delete class");
        return;
      }

      setClasses((current) => current.filter((course) => course.id !== courseId));
      setSelectedClassId((current) => (current === courseId ? null : current));
      toast.success("Class deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete class");
    }
  }

  return {
    classes,
    filteredClasses,
    selectedClass,
    loading,
    search,
    dialogOpen,
    timetableDialogOpen,
    submitting,
    editingClassId,
    form,
    subjectSuggestions,
    timetableSummary,
    setSearch,
    setDialogOpen,
    setTimetableDialogOpen,
    setForm,
    setSelectedClassId,
    openCreateDialog,
    openEditDialog,
    addSemester,
    removeSemester,
    addSubjectToSemester,
    removeSubjectFromSemester,
    updateSubjectInSemester,
    handleTimetableSave,
    handleSubmit,
    handleDelete,
  };
}

