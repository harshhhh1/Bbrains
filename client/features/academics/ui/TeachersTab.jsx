"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api, courseApi } from "@/services/api/client";
import { toast } from "sonner";
import { CrudDrawer } from "@/features/admin/ui/CrudDrawer";
import { ConfirmDialog } from "@/features/admin/ui/ConfirmDialog";
import { TeachersTable } from "@/features/admin/teachers/ui/TeachersTable";
import { TeacherForm } from "@/features/admin/teachers/ui/TeacherForm";
import { fetchTeachers } from "@/features/admin/teachers/api/data";
import { initForm, emptyTeacherForm } from "@/features/admin/teachers/types";
import { useHasPermission } from "@/components/providers/permissions-provider";

export function TeachersTab({
  initialTeachers,
  loading: externalLoading,
  onRefresh,
  createOpen,
  onCreateOpenChange,
}) {
  const canManageTeacher = useHasPermission("manage_teacher");
  const [teachers, setTeachers] = useState(initialTeachers);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyTeacherForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  const parseTeacherSubjects = useCallback((value) => {
    return value
      .split(/\r?\n|,/)
      .map((subject) => subject.trim())
      .filter(Boolean);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [teacherData, coursesResponse] = await Promise.all([
        fetchTeachers(),
        courseApi.getCourses(),
      ]);
      setTeachers(teacherData);
      if (coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (createOpen) {
      setEditing(null);
      setForm(emptyTeacherForm);
      setModalOpen(true);
      onCreateOpenChange?.(false);
    }
  }, [createOpen, onCreateOpenChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openEdit(t) {
    setEditing(t);
    setForm(initForm(t));
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim())
      return;
    const teacherSubjects = parseTeacherSubjects(form.teacherSubjectsText);
    if (teacherSubjects.length === 0) {
      toast.error("Add at least one subject for the teacher");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        sex: form.sex,
        dob: form.dob || "2000-01-01",
        phone: form.phone || undefined,
        teacherSubjects,
        ...(form.classTeacherCourseId
          ? { classTeacherCourseId: Number(form.classTeacherCourseId) }
          : {}),
        ...(form.collegeId.trim() ? { collegeId: Number(form.collegeId) } : {}),
      };
      if (editing) {
        const r = await api.put(`/user/teachers/${editing.id}`, payload);
        if (r.success) {
          toast.success("Teacher updated");
          setTeachers((prev) =>
            prev.map((t) => (t.id === editing.id ? r.data : t)),
          );
          setModalOpen(false);
          onRefresh?.();
        } else {
          toast.error(r.message || "Failed to update teacher");
        }
      } else {
        const r = await api.post("/user/teachers", {
          ...payload,
          password: "TemporaryPassword123!",
        });
        if (r.success) {
          toast.success("Teacher added");
          setTeachers((prev) => [r.data, ...prev]);
          setModalOpen(false);
          onRefresh?.();
        } else {
          toast.error(r.message || "Failed to add teacher");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/user/teachers/${deleteTarget.id}`);
      if (res.success) {
        toast.success("Teacher deleted");
        setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
        onRefresh?.();
      } else {
        toast.error(res.message || "Failed to delete teacher");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete teacher");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <TeachersTable
        loading={loading || externalLoading}
        data={teachers}
        onEdit={canManageTeacher ? openEdit : undefined}
        onDelete={canManageTeacher ? setDeleteTarget : undefined}
      />

      <CrudDrawer
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editing ? "Edit Teacher" : "Add Teacher"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <TeacherForm
          form={form}
          onChange={setForm}
          submitting={submitting}
          isEditing={!!editing}
          courses={courses}
        />
      </CrudDrawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete Teacher"
        description={`Are you sure you want to delete teacher "${deleteTarget?.username}"? This action cannot be undone.`}
      />
    </>
  );
}
