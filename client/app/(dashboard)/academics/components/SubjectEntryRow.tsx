import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectEntry } from "../hooks/useCourseForm";
import { Student } from "../../types/academics-types/academics-types";

interface SubjectEntryRowProps {
  subject: SubjectEntry;
  teachers: Student[];
  loadingTeachers: boolean;
  onUpdate: (id: string, field: "name" | "teacherId", value: string) => void;
  onRemove: (id: string) => void;
}

export function SubjectEntryRow({
  subject,
  teachers,
  loadingTeachers,
  onUpdate,
  onRemove,
}: SubjectEntryRowProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-muted/30 p-2 rounded-lg border border-border/50">
      <div className="flex-1 w-full">
        <Input
          placeholder="Subject Name (e.g. Mathematics)"
          value={subject.name}
          onChange={(e) => onUpdate(subject.id, "name", e.target.value)}
          className="bg-background"
        />
      </div>
      <div className="flex-1 w-full flex gap-2">
        <Select
          value={subject.teacherId}
          onValueChange={(val) => onUpdate(subject.id, "teacherId", val)}
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
          onClick={() => onRemove(subject.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function EmptySubjectState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/70 rounded-xl bg-muted/20">
      <BookOpen className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
      <p className="text-sm text-muted-foreground">No subjects added yet</p>
      <Button type="button" variant="link" size="sm" onClick={onAdd} className="mt-1">
        Add your first subject
      </Button>
    </div>
  );
}
