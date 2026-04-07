import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { courseApi, Course, ClassTimetableEntry } from "@/services/api/client";
import { ClassFormState, emptyForm } from "../types";
import { parseSubjects } from "../utils";

export function useClasses() {
  const [classes, setClasses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingClassId, setEditingClassId] = useState<Course["id"] | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<Course["id"] | null>(null);
  const [form, setForm] = useState<ClassFormState>(emptyForm);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourses();
      if (response.success) {
        const nextClasses = response.data || [];
        setClasses(nextClasses);
        setSelectedClassId((current) => current || nextClasses[0]?.id || null);
      } else {
        toast.error(response.message || "Failed to load classes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    const lowerSearch = search.toLowerCase();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        (c.standard && c.standard.toLowerCase().includes(lowerSearch))
    );
  }, [classes, search]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) || null,
    [classes, selectedClassId]
  );

  const handleEdit = (c: Course) => {
    setForm({
      name: c.name || "",
      description: c.description || "",
      standard: c.standard || "",
      subjectsText: c.subjects ? c.subjects.join(", ") : "",
      feePerStudent: c.feePerStudent ? String(c.feePerStudent) : "",
      durationValue: c.duration?.value ? String(c.duration.value) : "",
      durationUnit: c.duration?.unit === "years" ? "years" : "months",
      studentCapacity: c.studentCapacity ? String(c.studentCapacity) : "",
      timetable: c.timetable || [],
    });
    setEditingClassId(c.id);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setForm(emptyForm);
    setEditingClassId(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.standard) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const subjects = parseSubjects(form.subjectsText);

      const payload = {
        name: form.name,
        description: form.description,
        standard: form.standard,
        subjects,
        feePerStudent: form.feePerStudent ? Number(form.feePerStudent) : null,
        duration: form.durationValue
          ? {
              value: Number(form.durationValue),
              unit: form.durationUnit,
            }
          : undefined,
        studentCapacity: form.studentCapacity ? Number(form.studentCapacity) : null,
        timetable: form.timetable,
      };

      if (editingClassId) {
        await courseApi.updateCourse(editingClassId, payload);
        toast.success("Class updated successfully");
      } else {
        await courseApi.createCourse(payload);
        toast.success("Class created successfully");
      }

      setDialogOpen(false);
      await loadClasses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimetableSave = (newTimetable: ClassTimetableEntry[]) => {
    setForm((prev) => ({ ...prev, timetable: newTimetable }));
  };

  return {
    classes,
    loading,
    search,
    setSearch,
    dialogOpen,
    setDialogOpen,
    timetableDialogOpen,
    setTimetableDialogOpen,
    submitting,
    editingClassId,
    selectedClassId,
    setSelectedClassId,
    form,
    setForm,
    filteredClasses,
    selectedClass,
    handleEdit,
    handleCreate,
    handleSave,
    handleTimetableSave,
  };
}
