"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { courseApi, type ClassTimetableEntry, type Course } from "@/services/api/client";
import { emptyForm, parseSubjects, summarizeTimetable } from "../utils/classes";
import type { ClassFormState } from "../types/classes";

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
      feePerStudent: Number(form.feePerStudent || 0),
      durationValue: Number(form.durationValue || 0),
      durationUnit: form.durationUnit,
      studentCapacity: Number(form.studentCapacity || 0),
      timetable: timetable.map((entry) => ({
        ...entry,
        subject: entry.subject.trim(),
        room: entry.room?.trim() || "",
      })),
    };

    if (payload.feePerStudent < 0 || payload.durationValue <= 0 || payload.studentCapacity <= 0) {
      toast.error("Fees, duration, and student capacity must be valid positive values");
      return;
    }

    try {
      setSubmitting(true);
      const response = editingClassId
        ? await courseApi.updateCourse(editingClassId, payload)
        : await courseApi.createCourse(payload);

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to save class");
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
    handleTimetableSave,
    handleSubmit,
    handleDelete,
  };
}
