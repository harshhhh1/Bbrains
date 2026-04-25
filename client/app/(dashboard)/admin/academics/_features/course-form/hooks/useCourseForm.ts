import { useState, useEffect } from "react";
import { toast } from "sonner";
import { courseApi, userApi } from "@/services/api/client";
import { Course, Student } from "../../types";

export interface SubjectEntry {
  id: string;
  name: string;
  teacherId: string;
}

interface UseCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (course: Course) => void;
}

export function useCourseForm({ open, onOpenChange, onSuccess }: UseCourseFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teachers, setTeachers] = useState<Student[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [standard, setStandard] = useState("");
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);

  useEffect(() => {
    if (open) {
      void fetchTeachers();
    } else {
      setName("");
      setDescription("");
      setStandard("");
      setSubjects([]);
    }
  }, [open]);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await userApi.getTeachers();
      if (res.success && res.data) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const addSubject = () => {
    setSubjects((current) => [...current, { id: Date.now().toString(), name: "", teacherId: "none" }]);
  };

  const removeSubject = (id: string) => {
    setSubjects((current) => current.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: "name" | "teacherId", value: string) => {
    setSubjects((current) =>
      current.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (!standard.trim()) {
      toast.error("Standard is required");
      return;
    }

    const validSubjects = subjects.filter((s) => s.name.trim() !== "");
    if (validSubjects.length === 0) {
      toast.error("Add at least one valid subject");
      return;
    }

    const subjectNames = validSubjects.map((s) => s.name.trim());
    const subjectProgress = validSubjects.map((s) => ({
      subject: s.name.trim(),
      totalChapters: 0,
      completedChapters: 0,
      ...(s.teacherId !== "none" && { teacherId: s.teacherId }),
    }));

    try {
      setSubmitting(true);
      const res = await courseApi.createCourse({
        name: name.trim(),
        description: description.trim() || undefined,
        standard: standard.trim(),
        subjects: subjectNames,
        subjectProgress,
      });

      if (res.success && res.data) {
        toast.success("Course created successfully");
        onSuccess(res.data as unknown as Course);
        onOpenChange(false);
      } else {
        toast.error(res.message || "Failed to create course");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    loadingTeachers,
    teachers,
    name,
    setName,
    description,
    setDescription,
    standard,
    setStandard,
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
    handleSubmit,
  };
}
