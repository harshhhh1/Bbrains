import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, courseApi, userApi, assignmentApi } from "@/services/api/client";
import { Course, AdminAssignment, Student } from "../types";
import { toast } from "sonner";
import { useHasPermission } from "@/components/providers/permissions-provider";

export function useAcademics() {
  const router = useRouter();
  const canCreateCourse = useHasPermission("create_course");
  const canManageCourse = useHasPermission("manage_course");
  const [tab, setTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, studentsRes, assignmentsRes] = await Promise.all([
        courseApi.getCourses(),
        userApi.getStudents(),
        assignmentApi.getAssignments(),
      ]);

      if (coursesRes.success) setCourses(coursesRes.data || []);
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch academics data:", error);
      toast.error("Failed to load academic data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddClick = () => {
    if (tab === "courses") {
      router.push("/dashboard/manager/classes");
      return;
    }

    if (tab === "students") {
      router.push("/dashboard/admin/students");
      return;
    }

    router.push("/dashboard/admin/assignments");
  };

  const handleEditClick = (course: Course) => {
    router.push(`/dashboard/manager/classes?courseId=${course.id}`);
  };

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;

    try {
      setDeleting(true);

      if (tab === "courses") {
        const response = await courseApi.deleteCourse(deleteId);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete course");
        }
        setCourses((current) => current.filter((course) => String(course.id) !== String(deleteId)));
      } else if (tab === "assignments") {
        const response = await api.delete(`/academic/assignments/${deleteId}`);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete assignment");
        }
        setAssignments((current) => current.filter((assignment) => String(assignment.id) !== String(deleteId)));
      } else {
        const response = await api.delete(`/user/delete/${deleteId}`);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete student");
        }
        setStudents((current) => current.filter((student) => String(student.id) !== String(deleteId)));
      }

      toast.success(`${tab === "courses" ? "Course" : tab === "assignments" ? "Assignment" : "Student"} deleted`);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [deleteId, tab]);

  return {
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
  };
}
