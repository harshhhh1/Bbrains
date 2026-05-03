import { useState, useEffect } from "react";
import { toast } from "sonner";
import { courseApi, userApi } from "@/services/api/client";
import { Course, Student } from "@/features/academics/types";

export interface SemesterSubject {
  id: string;
  name: string;
  code: string;
  examTotalMarks: number;
}

export interface SemesterEntry {
  id: string;
  semesterNumber: number;
  subjects: SemesterSubject[];
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
  const [semesterCount, setSemesterCount] = useState(1);
  const [sameSubjectsAllSemesters, setSameSubjectsAllSemesters] = useState(true);
  const [semesters, setSemesters] = useState<SemesterEntry[]>([
    { id: "1", semesterNumber: 1, subjects: [{ id: "1", name: "", code: "", examTotalMarks: 100 }] }
  ]);

  useEffect(() => {
    if (open) {
      void fetchTeachers();
    } else {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStandard("");
    setSemesterCount(1);
    setSameSubjectsAllSemesters(true);
    setSemesters([{ id: "1", semesterNumber: 1, subjects: [{ id: "1", name: "", code: "", examTotalMarks: 100 }] }]);
  };

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

  const handleSemesterCountChange = (count: number) => {
    if (count < 1 || count > 12) return;
    setSemesterCount(count);
    
    const currentCount = semesters.length;
    if (count > currentCount) {
      const newSemesters = [...semesters];
      for (let i = currentCount; i < count; i++) {
        newSemesters.push({
          id: Date.now().toString() + i,
          semesterNumber: i + 1,
          subjects: [{ id: Date.now().toString() + i + "s", name: "", code: "", examTotalMarks: 100 }]
        });
      }
      setSemesters(newSemesters);
    } else if (count < currentCount) {
      setSemesters(semesters.slice(0, count));
    }
  };

  const addSubjectToSemester = (semesterId: string) => {
    setSemesters(current =>
      current.map(sem => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            subjects: [...sem.subjects, { id: Date.now().toString(), name: "", code: "", examTotalMarks: 100 }]
          };
        }
        return sem;
      })
    );
  };

  const removeSubjectFromSemester = (semesterId: string, subjectId: string) => {
    setSemesters(current =>
      current.map(sem => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            subjects: sem.subjects.filter(s => s.id !== subjectId)
          };
        }
        return sem;
      })
    );
  };

  const updateSubjectInSemester = (semesterId: string, subjectId: string, field: keyof SemesterSubject, value: string | number) => {
    setSemesters(current =>
      current.map(sem => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            subjects: sem.subjects.map(s => s.id === subjectId ? { ...s, [field]: value } : s)
          };
        }
        return sem;
      })
    );
  };

  const copyFirstSemesterSubjects = () => {
    if (semesters.length === 0) return;
    const firstSemester = semesters[0];
    const updated = semesters.map((sem, index) => {
      if (index === 0) return sem;
      return {
        ...sem,
        subjects: firstSemester.subjects.map(sub => ({ ...sub, id: sub.id + index }))
      };
    });
    setSemesters(updated);
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

    const validSemesters = semesters.filter(sem => {
      const validSubjects = sem.subjects.filter(sub => sub.name.trim() && sub.code.trim());
      return validSubjects.length > 0;
    });

    if (validSemesters.length === 0) {
      toast.error("Add at least one valid subject");
      return;
    }

    const semestersData = validSemesters.map(sem => ({
      semesterNumber: sem.semesterNumber,
      subjects: sem.subjects
        .filter(sub => sub.name.trim() && sub.code.trim())
        .map(sub => ({
          name: sub.name.trim(),
          code: sub.code.trim().toUpperCase(),
          examTotalMarks: Number(sub.examTotalMarks) || 100
        }))
    }));

    try {
      setSubmitting(true);
      const res = await courseApi.createCourse({
        name: name.trim(),
        description: description.trim() || undefined,
        standard: standard.trim(),
        semesters: semestersData,
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
    semesterCount,
    setSemesterCount: handleSemesterCountChange,
    sameSubjectsAllSemesters,
    setSameSubjectsAllSemesters,
    semesters,
    addSubjectToSemester,
    removeSubjectFromSemester,
    updateSubjectInSemester,
    copyFirstSemesterSubjects,
    handleSubmit,
  };
}