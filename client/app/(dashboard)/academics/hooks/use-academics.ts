import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, courseApi, userApi, assignmentApi } from "@/services/api/client";
import { Course, AdminAssignment, Student, Teacher } from "../types/academics-types";
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
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);


  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const coursesRes = await courseApi.getCourses();

      if (coursesRes.success) setCourses(coursesRes.data || []);
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
      setCourseModalOpen(true);
      return;
    }
  };


  const handleEditClick = (course: Course) => {
    router.push(`/manager/classes?courseId=${course.id}`);
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
      }

      toast.success(`${tab === "courses" ? "Course" : "Item"} deleted`);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [deleteId, tab]);

  const onCourseCreated = useCallback((newCourse: Course) => {
    setCourses((current) => [...current, newCourse]);
  }, []);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setEnrollmentModalOpen(true);
  };


  return {
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
    router,

  };
}

