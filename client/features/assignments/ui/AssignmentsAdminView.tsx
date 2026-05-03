"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { DataTable } from "@/features/admin/ui/DataTable"
import { CrudDrawer } from "@/features/admin/ui/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/ui/ConfirmDialog"
import { SectionHeader } from "@/features/admin/ui/SectionHeader"
import { toast } from "sonner"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { BookOpen } from "lucide-react"
import type { ApiAssignment, ApiCourse } from "@/lib/types/api"
import { AssignmentForm } from "@/features/assignments/ui/AssignmentForm"

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

interface AssignmentFormValues { description: string; title: string; courseId: string; dueDate: string; file?: string }
const emptyAssForm: AssignmentFormValues = { title: "", description: "", courseId: "", dueDate: "", file: undefined }

export function AssignmentsAdminView() {
    const [assignments, setAssignments] = useState<ApiAssignment[]>([])
    const [courses, setCourses] = useState<ApiCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiAssignment | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiAssignment | null>(null)
    const [form, setForm] = useState<AssignmentFormValues>(emptyAssForm)
    const [submitting, setSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    
    const { uploadFile, isUploading } = useCloudinaryUpload()

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const [aRes, cRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
                c.get<{ success: boolean; data: ApiCourse[] }>("/courses?limit=100"),
            ])
            setAssignments(Array.isArray(aRes.data.data) ? aRes.data.data : [])
            setCourses(Array.isArray(cRes.data.data) ? cRes.data.data : [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load assignments")
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    function openCreate() {
        if (courses.length === 0) {
            toast.error("Create a class first before adding an assignment")
            return
        }
        setEditing(null); setForm(emptyAssForm); setSelectedFile(null); setModalOpen(true)
    }
    
    function openEdit(a: ApiAssignment) {
        setEditing(a)
        setForm({ 
            title: a.title, 
            description: a.description ?? "", 
            courseId: String(a.courseId), 
            dueDate: a.dueDate?.slice(0, 10) ?? "",
            file: a.file ?? undefined
        })
        setSelectedFile(null); setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.title.trim() || !form.courseId) {
            toast.error("Assignment title and class are required")
            return
        }
        try {
            setSubmitting(true)
            let fileUrl = form.file
            if (selectedFile) {
                const uploaded = await uploadFile(selectedFile, { folder: "assignment" })
                if (uploaded) fileUrl = uploaded
            }

            const payload = { ...form, file: fileUrl, courseId: Number(form.courseId) }
            const c = await getAuthedClient()
            const res = editing
                ? await c.put<{ success: boolean; data: ApiAssignment }>(`/academic/assignments/${editing.id}`, payload)
                : await c.post<{ success: boolean; data: ApiAssignment }>("/academic/assignments", payload)

            if (res.data.success) {
                toast.success(editing ? "Assignment updated" : "Assignment created")
                await load()
                setModalOpen(false)
            } else {
                toast.error("Operation failed")
            }
        } catch (error) {
            console.error(error); toast.error("An error occurred")
        } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient()
            const res = await c.delete<{ success: boolean }>(`/academic/assignments/${deleteTarget.id}`)
            if (res.data.success) {
                toast.success("Assignment deleted")
                setAssignments(prev => prev.filter(a => a.id !== deleteTarget.id))
                setDeleteTarget(null)
            }
        } catch (error) {
            console.error(error); toast.error("Delete failed")
        } finally { setSubmitting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader
                title="Management"
                subtitle={`${assignments.length} assignments active`}
                action={{
                    label: "New Assignment",
                    icon: <BookOpen className="size-4" />,
                    onClick: openCreate,
                }}
            />

            <DataTable
                loading={loading}
                data={assignments}
                columns={[
                    { label: "Title", key: "title" },
                    { label: "Class", key: "course", render: (a) => a.course?.name || "General" },
                    { label: "Due Date", key: "dueDate", render: (a) => fmtDate(a.dueDate) },
                    { label: "Points", key: "rewardPoints" },
                ]}
                searchKeys={["title"]}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
            />

            <CrudDrawer
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                title={editing ? "Edit Assignment" : "Create Assignment"}
                onSubmit={handleSubmit}
                submitting={submitting}
            >
                <AssignmentForm
                    form={form}
                    onChange={setForm}
                    courses={courses}
                    selectedFile={selectedFile}
                    onFileChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    onRemoveFile={() => { setSelectedFile(null); setForm({ ...form, file: undefined }) }}
                    isUploading={isUploading}
                    disabled={submitting}
                />
            </CrudDrawer>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirming={submitting}
                title="Delete Assignment"
                description="Are you sure? This will remove all student submissions for this assignment."
            />
        </div>
    )
}
