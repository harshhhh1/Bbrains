"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, NotebookPen, Target, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import {
  assessmentApi,
  type Assessment,
  type AssessmentCourseOption,
  type AssessmentStudent,
} from "@/services/api/client"
import { AssessmentCreationForm } from "./AssessmentCreationForm"
import { GradingTable } from "./GradingTable"
import { AssessmentHistory } from "./AssessmentHistory"

type AssessmentForm = {
  courseId: string
  subject: string
  topic: string
  assessmentType: "test" | "exam"
  assessmentDate: string
  totalMarks: string
}

type AssessmentRow = {
  studentId: string
  marksObtained: string
  remark: string
}

const emptyForm: AssessmentForm = {
  courseId: "",
  subject: "",
  topic: "",
  assessmentType: "test",
  assessmentDate: "",
  totalMarks: "",
}

export function TeacherAssessmentWorkspace() {
  const [courses, setCourses] = useState<AssessmentCourseOption[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([])
  const [eligibleStudents, setEligibleStudents] = useState<AssessmentStudent[]>([])
  const [assessmentRows, setAssessmentRows] = useState<AssessmentRow[]>([])
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(emptyForm)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [loadingAssessments, setLoadingAssessments] = useState(true)
  const [assessmentSetupLoading, setAssessmentSetupLoading] = useState(false)
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === assessmentForm.courseId) || null,
    [courses, assessmentForm.courseId]
  )

  const subjectOptions = useMemo(() => {
    if (selectedCourse?.availableSubjects?.length) return selectedCourse.availableSubjects
    if (teacherSubjects.length) return teacherSubjects
    if (selectedCourse?.subjects?.length) return selectedCourse.subjects
    return []
  }, [selectedCourse, teacherSubjects])

  const loadDashboard = useCallback(async () => {
    try {
      setLoadingAssessments(true)
      const [setupResponse, assessmentsResponse] = await Promise.all([
        assessmentApi.getSetup(),
        assessmentApi.getTeacherAssessments(),
      ])

      if (setupResponse.success && setupResponse.data) {
        setCourses(setupResponse.data.courses || [])
        setTeacherSubjects(setupResponse.data.teacherSubjects || [])
      }

      if (assessmentsResponse.success && assessmentsResponse.data) {
        setAssessments(assessmentsResponse.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load tests and exams")
    } finally {
      setLoadingAssessments(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (subjectOptions.length === 1) {
      setAssessmentForm((current) =>
        current.subject === subjectOptions[0] ? current : { ...current, subject: subjectOptions[0] }
      )
      return
    }

    if (assessmentForm.subject && !subjectOptions.includes(assessmentForm.subject)) {
      setAssessmentForm((current) => ({ ...current, subject: "" }))
    }
  }, [assessmentForm.subject, subjectOptions])

  useEffect(() => {
    async function loadEligibleStudents() {
      if (!assessmentForm.courseId || !assessmentForm.assessmentDate) {
        setEligibleStudents([])
        return
      }

      try {
        setAssessmentSetupLoading(true)
        const response = await assessmentApi.getSetup({
          courseId: Number(assessmentForm.courseId),
          date: assessmentForm.assessmentDate,
          assessmentType: assessmentForm.assessmentType,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load students")
        }

        setCourses(response.data.courses || [])
        setTeacherSubjects(response.data.teacherSubjects || [])
        setEligibleStudents(response.data.eligibleStudents || [])
      } catch (error) {
        console.error(error)
        setEligibleStudents([])
        toast.error("Failed to load present students for that date")
      } finally {
        setAssessmentSetupLoading(false)
      }
    }

    void loadEligibleStudents()
  }, [assessmentForm.courseId, assessmentForm.assessmentDate, refreshKey])

  useEffect(() => {
    setAssessmentRows((previousRows) => {
      const previousMap = new Map(previousRows.map((row) => [row.studentId, row]))
      const editingMap = new Map(
        (editingAssessment?.results || []).map((result) => [
          result.studentId,
          {
            studentId: result.studentId,
            marksObtained: String(result.marksObtained ?? ""),
            remark: result.remark ?? "",
          },
        ])
      )

      return eligibleStudents.map((student) => {
        const fromEdit = editingMap.get(student.id)
        const existing = previousMap.get(student.id)
        return {
          studentId: student.id,
          marksObtained: fromEdit?.marksObtained ?? existing?.marksObtained ?? "",
          remark: fromEdit?.remark ?? existing?.remark ?? "",
        }
      })
    })
  }, [eligibleStudents, editingAssessment?.id])

  function resetComposer() {
    setAssessmentForm(emptyForm)
    setEligibleStudents([])
    setAssessmentRows([])
    setEditingAssessment(null)
  }

  function handleAssessmentRowChange(studentId: string, key: "marksObtained" | "remark", value: string) {
    setAssessmentRows((current) =>
      current.map((row) => (row.studentId === studentId ? { ...row, [key]: value } : row))
    )
  }

  function startEditingAssessment(assessment: Assessment) {
    setEditingAssessment(assessment)
    setAssessmentForm({
      courseId: String(assessment.courseId),
      subject: assessment.subject,
      topic: assessment.topic,
      assessmentType: assessment.assessmentType,
      assessmentDate: assessment.assessmentDate.slice(0, 10),
      totalMarks: String(assessment.totalMarks),
    })
    setRefreshKey((value) => value + 1)
  }

  async function handleAssessmentSubmit() {
    if (!assessmentForm.courseId || !assessmentForm.assessmentDate || !assessmentForm.topic.trim() || !assessmentForm.subject) {
      toast.error("Class, date, subject, and topic are required")
      return
    }

    const totalMarks = Number(assessmentForm.totalMarks)
    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
      toast.error("Total marks must be greater than zero")
      return
    }

    if (eligibleStudents.length === 0) {
      toast.error("No present students were found for that class on that date")
      return
    }

    if (assessmentRows.some((row) => row.marksObtained === "")) {
      toast.error("Enter marks for every present student")
      return
    }

    const payload = {
      courseId: Number(assessmentForm.courseId),
      subject: assessmentForm.subject,
      topic: assessmentForm.topic.trim(),
      assessmentType: assessmentForm.assessmentType,
      assessmentDate: assessmentForm.assessmentDate,
      totalMarks,
      results: assessmentRows.map((row) => ({
        studentId: row.studentId,
        marksObtained: Number(row.marksObtained),
        remark: row.remark.trim() || undefined,
      })),
    }

    try {
      setAssessmentSubmitting(true)
      const response = editingAssessment
        ? await assessmentApi.updateAssessment(editingAssessment.id, payload)
        : await assessmentApi.createAssessment(payload)

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to save assessment")
      }

      toast.success(editingAssessment ? "Assessment updated" : "Assessment published")
      resetComposer()
      await loadDashboard()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to save assessment")
    } finally {
      setAssessmentSubmitting(false)
    }
  }

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Faculty Assessment Portal"
        subtitle="Finalize published records for tests and examinations based on daily attendance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm group">
          <CardContent className="p-6">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Records Published</p>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums">{loadingAssessments ? "--" : assessments.length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entries</span>
             </div>
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-x-4 -translate-y-4 group-hover:bg-primary/10 transition-colors" />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Teacher Subjects</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex flex-wrap gap-2">
                {teacherSubjects.length ? teacherSubjects.map((s) => <Badge key={s} variant="secondary" className="font-bold text-[10px]">{s}</Badge>) : <span className="text-xs text-muted-foreground font-medium italic">Pending Assignment</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-primary/20 bg-primary/5 shadow-sm">
           <CardContent className="p-6">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Active Candidates</p>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums text-primary">{assessmentSetupLoading ? "--" : eligibleStudents.length}</span>
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Roster Size</span>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-border/60 overflow-hidden bg-card/50 shadow-xl">
        <CardHeader className="p-8 bg-muted/30 border-b border-border/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">{editingAssessment ? "Modify Published Record" : "Publish Assessment"}</CardTitle>
              <CardDescription className="font-medium">Define parameters and input marks for present students.</CardDescription>
            </div>
            {editingAssessment && (
              <Button variant="outline" className="rounded-xl h-10 px-6 font-bold" onClick={resetComposer}>New Entry</Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <AssessmentCreationForm
            form={assessmentForm}
            onChange={(updates) => setAssessmentForm(curr => ({ ...curr, ...updates }))}
            courses={courses}
            subjectOptions={subjectOptions}
          />

          <div className="space-y-6 pt-6 border-t border-border/40">
            <div className="flex items-center justify-between px-1">
               <div>
                  <h3 className="text-lg font-black tracking-tight">Examination Roster</h3>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Marks can only be assigned to candidates marked present on the selected date.</p>
               </div>
               {eligibleStudents.length > 0 && <Badge variant="outline" className="font-black uppercase tracking-widest text-[9px] px-3 py-1">{eligibleStudents.length} Students</Badge>}
            </div>

            {eligibleStudents.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
                 <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                 <p className="text-muted-foreground font-bold italic">Roster pending (Select class & date)</p>
              </div>
            ) : (
              <GradingTable
                students={eligibleStudents}
                rows={assessmentRows}
                maxMarks={Number(assessmentForm.totalMarks) || 0}
                onRowChange={handleAssessmentRowChange}
              />
            )}
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-border/40">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] max-w-xs leading-relaxed">
               Verified marks will be immediately accessible in student portfolios.
            </p>
            <Button
              size="lg"
              onClick={handleAssessmentSubmit}
              disabled={assessmentSubmitting || assessmentSetupLoading || eligibleStudents.length === 0}
              className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
            >
              {assessmentSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Target className="mr-2 h-5 w-5" />}
              {editingAssessment ? "Update Published Record" : "Finalize & Publish"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8 pt-12 border-t border-border/50">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Assessment Archives</h2>
          <p className="text-muted-foreground font-medium text-lg">Historical record of all published tests and exams.</p>
        </div>

        {loadingAssessments ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
             <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Registry...</p>
          </div>
        ) : assessments.length === 0 ? (
          <Card className="border-2 border-dashed border-border/40 bg-muted/10 rounded-[2.5rem] py-24">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <NotebookPen className="size-16 mb-6 text-muted-foreground/20" />
              <h3 className="text-2xl font-bold tracking-tight">Registry Empty</h3>
              <p className="text-muted-foreground mt-2 max-w-xs font-medium">Your published assessment history will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <AssessmentHistory assessments={assessments} onEdit={startEditingAssessment} />
        )}
      </div>
    </div>
  )
}
