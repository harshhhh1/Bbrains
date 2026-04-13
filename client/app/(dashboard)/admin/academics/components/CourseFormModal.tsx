import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courseApi, userApi } from "@/services/api/client";
import { Course, Student } from "../types";

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (course: Course) => void;
}

interface SubjectEntry {
  id: string;
  name: string;
  teacherId: string;
}

export function CourseFormModal({ open, onOpenChange, onSuccess }: CourseFormModalProps) {
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
      // Reset form on close
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>
            Define the course details and assign subjects to specific teachers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                placeholder="e.g. Science Class 10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard">Standard</Label>
              <Input
                id="standard"
                placeholder="e.g. 10th Standard"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Short clear description of the course..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Subjects & Teachers</Label>
                <p className="text-xs text-muted-foreground mt-1">Assign teachers to their respective subjects.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                <Plus className="w-4 h-4 mr-1" /> Add Subject
              </Button>
            </div>

            {subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/70 rounded-xl bg-muted/20">
                <BookOpen className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No subjects added yet</p>
                <Button type="button" variant="link" size="sm" onClick={addSubject} className="mt-1">
                  Add your first subject
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-muted/30 p-2 rounded-lg border border-border/50">
                    <div className="flex-1 w-full">
                      <Input
                        placeholder="Subject Name (e.g. Mathematics)"
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex-1 w-full flex gap-2">
                      <Select
                        value={subject.teacherId}
                        onValueChange={(val) => updateSubject(subject.id, "teacherId", val)}
                        disabled={loadingTeachers}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Assign Teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Teacher Assigned</SelectItem>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.userDetails?.firstName || t.username} {t.userDetails?.lastName || ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeSubject(subject.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
