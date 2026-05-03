"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Loader2,
  NotebookPen,
  Target,
  Save,
  CalendarDays,
  BookOpen,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SectionHeader } from "@/features/admin/ui/SectionHeader"
import {
  examApi,
  assessmentApi,
  type ApiExam,
  type AssessmentCourseOption,
} from "@/services/api/client"
import { AssessmentResultsTab } from "@/features/assignments/ui/AssessmentResultsTab"

/* ─── Types ─── */

type ExamForm = {
  courseId: string
  semesterNumber: string
  subjectCode: string
  topic: string
  examDate: string
}

const emptyForm: ExamForm = {
  courseId: "",
  semesterNumber: "",
  subjectCode: "",
  topic: "",
  examDate: "",
}

type SemesterInfo = {
  semesterNumber: number
  subjects: Array<{
    name: string
    code: string
    examTotalMarks: number
  }>
}

/* ─── Helpers ─── */

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/* ─── Component ─── */

export function TeacherAssessmentWorkspace() {
  const [courses, setCourses] = useState<AssessmentCourseOption[]>([])
  const [exams, setExams] = useState<ApiExam[]>([])
  const [form, setForm] = useState<ExamForm>(emptyForm)
  const [loadingSetup, setLoadingSetup] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  /* ── Data Loading ── */

  const loadDashboard = useCallback(async () => {
    try {
      setLoadingSetup(true)
      const [setupRes, examsRes] = await Promise.all([
        examApi.getExamSetup(),
        examApi.getTeacherExams(),
      ])

      if (setupRes.success && setupRes.data) {
        setCourses(setupRes.data.courses || [])
      }

      if (examsRes.success && examsRes.data) {
        setExams(Array.isArray(examsRes.data) ? examsRes.data : [])
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load exam data")
    } finally {
      setLoadingSetup(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  /* ── Derived State ── */

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === form.courseId) || null,
    [courses, form.courseId]
  )

  const semesters: SemesterInfo[] = useMemo(() => {
    if (!selectedCourse?.semesters) return []
    return selectedCourse.semesters as SemesterInfo[]
  }, [selectedCourse])

  const selectedSemester = useMemo(
    () =>
      semesters.find(
        (s) => String(s.semesterNumber) === form.semesterNumber
      ) || null,
    [semesters, form.semesterNumber]
  )

  const subjects = useMemo(
    () => selectedSemester?.subjects || [],
    [selectedSemester]
  )

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.code === form.subjectCode) || null,
    [subjects, form.subjectCode]
  )

  /* ── Handlers ── */

  function updateForm(updates: Partial<ExamForm>) {
    setForm((prev) => {
      const next = { ...prev, ...updates }
      // Reset downstream selections when parent changes
      if (updates.courseId !== undefined) {
        next.semesterNumber = ""
        next.subjectCode = ""
      }
      if (updates.semesterNumber !== undefined && !updates.subjectCode) {
        next.subjectCode = ""
      }
      return next
    })
  }

  async function handleCreateExam() {
    if (
      !form.courseId ||
      !form.semesterNumber ||
      !form.subjectCode ||
      !form.topic.trim() ||
      !form.examDate
    ) {
      toast.error("All fields are required")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        courseId: Number(form.courseId),
        semesterNumber: Number(form.semesterNumber),
        subjectCode: form.subjectCode,
        topic: form.topic.trim(),
        examDate: form.examDate,
      }

      const res = await examApi.createExam(payload)
      if (res.success && res.data) {
        toast.success("Exam created successfully")
        setForm(emptyForm)
        await loadDashboard()
      } else {
        toast.error(res.message || "Failed to create exam")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to create exam")
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render ── */

  if (loadingSetup) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading…
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Tests & Examinations"
        subtitle="Manage exam schedules and enter student results."
      />

      <Tabs defaultValue="setup" className="space-y-8">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="setup" className="gap-2">
            <CalendarDays className="size-3.5" />
            Exam Setup
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <ClipboardList className="size-3.5" />
            Enter Results
          </TabsTrigger>
        </TabsList>

        {/* ═══════ SETUP TAB ═══════ */}
        <TabsContent value="setup" className="mt-0 border-none p-0 outline-none">
          <div className="space-y-10">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm group">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Total Exams
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums">
                      {exams.length}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Scheduled
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Classes
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums">
                      {courses.length}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Available
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-primary/20 bg-primary/5 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                    Results Entered
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums text-primary">
                      {exams.reduce(
                        (sum, e) => sum + (e.results?.length || 0),
                        0
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                      Records
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Exam Form */}
            <Card className="rounded-[2.5rem] border-border/60 overflow-hidden bg-card/50 shadow-xl">
              <CardHeader className="p-8 bg-muted/30 border-b border-border/40">
                <CardTitle className="text-2xl font-black tracking-tight">
                  Schedule New Exam
                </CardTitle>
                <CardDescription className="font-medium">
                  Define the exam parameters. Students will be notified 1 week
                  before the exam date.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {/* Class */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Class
                    </label>
                    <Select
                      value={form.courseId}
                      onValueChange={(v) => updateForm({ courseId: v })}
                    >
                      <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                            {c.standard ? ` (${c.standard})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Semester
                    </label>
                    <Select
                      value={form.semesterNumber}
                      onValueChange={(v) => updateForm({ semesterNumber: v })}
                      disabled={!form.courseId || semesters.length === 0}
                    >
                      <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
                        <SelectValue
                          placeholder={
                            semesters.length === 0
                              ? "No semesters"
                              : "Select semester"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {semesters.map((s) => (
                          <SelectItem
                            key={s.semesterNumber}
                            value={String(s.semesterNumber)}
                          >
                            Semester {s.semesterNumber} ({s.subjects.length}{" "}
                            subjects)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Subject
                    </label>
                    <Select
                      value={form.subjectCode}
                      onValueChange={(v) => updateForm({ subjectCode: v })}
                      disabled={!form.semesterNumber || subjects.length === 0}
                    >
                      <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
                        <SelectValue
                          placeholder={
                            subjects.length === 0
                              ? "Select semester first"
                              : "Select subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {subjects.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name} ({s.code}) — Max: {s.examTotalMarks}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic / Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Topic / Title
                    </label>
                    <Input
                      className="rounded-xl h-11 font-medium bg-muted/20 border-border/40"
                      value={form.topic}
                      placeholder="e.g. Mid-Term Examination"
                      onChange={(e) => updateForm({ topic: e.target.value })}
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Exam Date
                    </label>
                    <Input
                      type="date"
                      className="rounded-xl h-11 font-bold bg-muted/20 border-border/40"
                      value={form.examDate}
                      onChange={(e) => updateForm({ examDate: e.target.value })}
                    />
                  </div>

                  {/* Total Marks (auto-filled) */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Total Marks
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-border/40 bg-muted/40 px-3 text-sm font-black">
                      {selectedSubject
                        ? selectedSubject.examTotalMarks
                        : "Auto-filled from subject"}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
                    size="lg"
                    onClick={handleCreateExam}
                    disabled={submitting}
                    className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-5 w-5" />
                    )}
                    Save Exam
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exam History */}
            <div className="space-y-6 pt-8 border-t border-border/50">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight">
                  Exam Schedule
                </h2>
                <p className="text-muted-foreground font-medium text-lg">
                  All scheduled examinations.
                </p>
              </div>

              {exams.length === 0 ? (
                <Card className="border-2 border-dashed border-border/40 bg-muted/10 rounded-[2.5rem] py-24">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <NotebookPen className="size-16 mb-6 text-muted-foreground/20" />
                    <h3 className="text-2xl font-bold tracking-tight">
                      No Exams Scheduled
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-xs font-medium">
                      Create your first exam using the form above.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-muted/10 p-6 lg:flex-row lg:items-center lg:justify-between hover:bg-muted/20 transition-colors group"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-black uppercase tracking-widest text-[9px] px-2 py-0.5 border-primary/20 text-primary bg-primary/5"
                          >
                            Sem {exam.semesterNumber}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="font-bold text-[10px]"
                          >
                            {exam.subjectName}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="font-bold text-[10px]"
                          >
                            {exam.course?.name || `Class ${exam.courseId}`}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">
                            {exam.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>{fmtDate(exam.examDate)}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>
                              {exam.results?.length || 0} Results Entered
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center rounded-xl bg-card border border-border/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                          <Target className="mr-2 h-4 w-4 text-primary" />
                          Max: {exam.totalMarks}
                        </div>
                        <div className="flex items-center rounded-xl bg-card border border-border/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                          <BookOpen className="mr-2 h-4 w-4 text-primary" />
                          {exam.subjectCode}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ═══════ RESULTS TAB ═══════ */}
        <TabsContent value="results" className="mt-0 border-none p-0 outline-none">
          <AssessmentResultsTab courses={courses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
