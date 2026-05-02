"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle } from "lucide-react";
import { courseApi, enrollmentApi, Course } from "@/services/api/client";
import { DashboardContent } from "@/components/dashboard-content";
import { CourseCard } from "./components/CourseCard";
import { CourseSkeleton } from "./components/CourseSkeleton";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          courseApi.getCourses(),
          enrollmentApi.getMyEnrollments(),
        ]);

        if (coursesRes.success && coursesRes.data) {
          if (enrollmentsRes.success && enrollmentsRes.data) {
            const enrolledIds = new Set(enrollmentsRes.data.map((e) => e.id));
            const coursesWithEnrollment = coursesRes.data.map((course) => ({
              ...course,
              isEnrolled: enrolledIds.has(course.id),
            }));
            setCourses(coursesWithEnrollment);
          } else {
            setCourses(coursesRes.data);
          }
        } else {
          setError(coursesRes.message || "Failed to load courses");
        }
      } catch {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string | number) => {
    setEnrolling(courseId);
    try {
      const response = await enrollmentApi.enroll(courseId);
      if (response.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c))
        );
      }
    } catch {
      // Handle error
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <DashboardContent className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground">Your enrolled courses this semester</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No courses available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              enrolling={enrolling === course.id} 
              onEnroll={handleEnroll} 
            />
          ))}
        </div>
      )}
    </DashboardContent>
  );
}
