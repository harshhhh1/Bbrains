import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SemesterSection({
  semesterNumber,
  subjects,
  onAddSubject,
  onRemoveSubject,
  onUpdateSubject,
  readOnly = false,
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Semester {semesterNumber}
        </Label>
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddSubject}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Subject
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground">
          <div className="col-span-4">Subject Name</div>
          <div className="col-span-3">Code</div>
          <div className="col-span-3">Total Marks</div>
          <div className="col-span-2"></div>
        </div>

        {subjects.map((subject) => (
          <div key={subject.id} className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <Input
                placeholder="e.g. Mathematics"
                value={subject.name}
                onChange={(e) =>
                  onUpdateSubject(subject.id, "name", e.target.value)
                }
                disabled={readOnly}
              />
            </div>
            <div className="col-span-3">
              <Input
                placeholder="MATH101"
                value={subject.code}
                onChange={(e) =>
                  onUpdateSubject(subject.id, "code", e.target.value)
                }
                disabled={readOnly}
                className="uppercase"
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                placeholder="100"
                value={subject.examTotalMarks}
                onChange={(e) =>
                  onUpdateSubject(
                    subject.id,
                    "examTotalMarks",
                    Number(e.target.value),
                  )
                }
                disabled={readOnly}
                min={1}
                max={1000}
              />
            </div>
            <div className="col-span-2 flex items-center justify-center">
              {!readOnly && subjects.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveSubject(subject.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
