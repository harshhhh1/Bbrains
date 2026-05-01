"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Save, ChevronRight, User, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { examApi, type ApiExam } from "@/services/api/client"

interface StudentInfo {
  id: string
  username: string
  email?: string
  userDetails?: {
    firstName?: string
    lastName?: string
    avatar?: string
  }
}

interface SubjectField {
  name: string
  code: string
  examTotalMarks: number
  marksObtained: string
}

interface ResultEntryDrawerProps {
  open: boolean
  student: StudentInfo | null
  exams: ApiExam[]
  onClose: () => void
  onSaved: () => void
  onSaveAndNext: () => void
  hasNext: boolean
}

function personName(student: StudentInfo | null) {
  if (!student) return "Student"
  const full = `${student.userDetails?.firstName || ""} ${student.userDetails?.lastName || ""}`.trim()
  return full || student.username || "Student"
}

export function ResultEntryDrawer({
  open,
  student,
  exams,
  onClose,
  onSaved,
  onSaveAndNext,
  hasNext,
}: ResultEntryDrawerProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [subjectFields, setSubjectFields] = useState<SubjectField[]>([])
  const [saving, setSaving] = useState(false)

  const selectedExam = useMemo(
    () => exams.find((e) => String(e.id) === selectedExamId) || null,
    [exams, selectedExamId]
  )

  // Reset when student changes
  useEffect(() => {
    setSelectedExamId("")
    setSubjectFields([])
  }, [student?.id])

  // When exam is selected, populate subject fields from the exam's semester data
  useEffect(() => {
    if (!selectedExam) {
      setSubjectFields([])
      return
    }

    // The exam itself has subject info - use it as a single field
    setSubjectFields([
      {
        name: selectedExam.subjectName,
        code: selectedExam.subjectCode,
        examTotalMarks: Number(selectedExam.totalMarks),
        marksObtained: "",
      },
    ])

    // Check if student already has a result for this exam
    if (selectedExam.results && student) {
      const existing = selectedExam.results.find(
        (r) => r.studentId === student.id
      )
      if (existing) {
        setSubjectFields([
          {
            name: selectedExam.subjectName,
            code: selectedExam.subjectCode,
            examTotalMarks: Number(selectedExam.totalMarks),
            marksObtained: String(existing.marksObtained ?? ""),
          },
        ])
      }
    }
  }, [selectedExam, student])

  function handleMarksChange(code: string, value: string) {
    setSubjectFields((prev) =>
      prev.map((f) => (f.code === code ? { ...f, marksObtained: value } : f))
    )
  }

  const doSave = useCallback(async () => {
    if (!student || !selectedExam) {
      toast.error("Select an exam first")
      return false
    }

    const incomplete = subjectFields.some((f) => f.marksObtained === "")
    if (incomplete) {
      toast.error("Enter marks for all subjects")
      return false
    }

    const overMax = subjectFields.some(
      (f) => Number(f.marksObtained) > f.examTotalMarks
    )
    if (overMax) {
      toast.error("Marks cannot exceed total marks")
      return false
    }

    try {
      setSaving(true)
      // Save result for each subject (currently one exam = one subject)
      for (const field of subjectFields) {
        await examApi.saveExamResult(selectedExam.id, {
          studentId: student.id,
          marksObtained: Number(field.marksObtained),
        })
      }
      toast.success(`Results saved for ${personName(student)}`)
      return true
    } catch (error) {
      console.error(error)
      toast.error("Failed to save results")
      return false
    } finally {
      setSaving(false)
    }
  }, [student, selectedExam, subjectFields])

  async function handleSave() {
    const ok = await doSave()
    if (ok) onSaved()
  }

  async function handleSaveAndNext() {
    const ok = await doSave()
    if (ok) onSaveAndNext()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border/40">
          <SheetTitle className="text-xl font-black tracking-tight">
            Enter Exam Results
          </SheetTitle>
          <SheetDescription className="font-medium">
            Record marks for the selected student.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-foreground truncate">
                {personName(student)}
              </p>
              <p className="text-xs font-bold text-muted-foreground">
                @{student?.username}
              </p>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] font-bold shrink-0"
            >
              {student?.id?.slice(0, 8)}…
            </Badge>
          </div>

          {/* Exam Picker */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Select Exam
            </label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
                <SelectValue placeholder="Choose an exam…" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={String(exam.id)}>
                    <span className="font-bold">{exam.subjectName}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      ({exam.topic} • Sem {exam.semesterNumber})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Fields */}
          {subjectFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <BookOpen className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Marks Entry
                </h4>
              </div>

              <div className="space-y-3">
                {subjectFields.map((field) => (
                  <div
                    key={field.code}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-background"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{field.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {field.code} • Max: {field.examTotalMarks}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max={field.examTotalMarks}
                      step="0.01"
                      value={field.marksObtained}
                      onChange={(e) =>
                        handleMarksChange(field.code, e.target.value)
                      }
                      placeholder="0"
                      className="w-24 rounded-xl h-10 font-black text-center bg-muted/20 border-border/40"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No exam selected state */}
          {!selectedExamId && (
            <div className="py-12 text-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5">
              <BookOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground italic">
                Select an exam above to enter marks
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 pt-6 border-t border-border/40 mt-auto">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving || !selectedExamId || subjectFields.length === 0}
            className="h-12 rounded-xl font-black uppercase tracking-widest text-xs"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>

          {hasNext && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleSaveAndNext}
              disabled={saving || !selectedExamId || subjectFields.length === 0}
              className="h-12 rounded-xl font-black uppercase tracking-widest text-xs border-primary/20 text-primary hover:bg-primary/5"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              Save & Next Student
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
