import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, GraduationCap, Users, BookOpen } from "lucide-react";
import { Course } from "@/features/academics/types";
import { Card } from "@/components/ui/card";

interface CoursesTableProps {
  courses: Course[];
  search: string;
  onDelete: (id: string | number) => void;
  onEdit?: (course: Course) => void;
  onEnroll?: (course: Course) => void;
}

export function CoursesTable({ courses, search, onDelete, onEdit, onEnroll }: CoursesTableProps) {
  const filteredCourses = courses.filter(c => 
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.standard && c.standard.toLowerCase().includes(search.toLowerCase()))
  );

  if (filteredCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No courses found matching your search</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredCourses.map((course) => (
        <Card 
          key={course.id} 
          className="group relative overflow-hidden border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base tracking-tight text-foreground">{course.name}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold h-5 px-1.5 border-primary/20 bg-primary/5 text-primary">
                    {course.standard || "N/A"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">
                  {course.description || "No description provided for this course."}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course._count?.enrollments || course.enrolledStudents || 0} Students Enrolled</span>
                  </div>
                  {course.subjects && course.subjects.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{course.subjects.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              {onEnroll && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30"
                  onClick={() => onEnroll(course)}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Enroll Users</span>
                </Button>
              )}
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg hover:bg-background hover:text-primary transition-colors"
                  onClick={() => onEdit(course)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors" 
                onClick={() => onDelete(course.id)}
                disabled={!onEdit}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
