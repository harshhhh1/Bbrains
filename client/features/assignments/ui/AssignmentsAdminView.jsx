"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAuthedClient } from "@/services/api/client";
import { CrudDrawer } from "@/features/admin/ui/CrudDrawer";
import { ConfirmDialog } from "@/features/admin/ui/ConfirmDialog";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import {
  BookOpen,
  Calendar,
  ListChecks,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssignmentForm } from "@/features/assignments/ui/AssignmentForm";

function fmtDate(s) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const emptyAssForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
  file: undefined,
  rewardPoints: "500",
  rewardCoins: "400",
};

export function AssignmentsAdminView() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyAssForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadFile, isUploading } = useCloudinaryUpload();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const c = await getAuthedClient();
      const [aRes, cRes] = await Promise.all([
        c.get("/academic/assignments"),
        c.get("/courses?limit=100"),
      ]);
      setAssignments(Array.isArray(aRes.data.data) ? aRes.data.data : []);
      setCourses(Array.isArray(cRes.data.data) ? cRes.data.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    if (courses.length === 0) {
      toast.error("Create a class first before adding an assignment");
      return;
    }
    setEditing(null);
    setForm(emptyAssForm);
    setSelectedFile(null);
    setModalOpen(true);
  }
  function openEdit(a) {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description ?? "",
      courseId: String(a.courseId),
      dueDate: a.dueDate?.slice(0, 10) ?? "",
      file: a.file ?? undefined,
      rewardPoints: String(a.rewardPoints ?? 0),
      rewardCoins: String(a.rewardCoins ?? 0),
    });
    setSelectedFile(null);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.courseId) {
      toast.error("Assignment title and class are required");
      return;
    }
    try {
      setSubmitting(true);
      let fileUrl = form.file;
      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile, {
          folder: "assignment",
        });
        if (uploaded) fileUrl = uploaded;
      }

      const payload = {
        ...form,
        file: fileUrl,
        courseId: Number(form.courseId),
        rewardPoints: Number(form.rewardPoints),
        rewardCoins: Number(form.rewardCoins),
      };
      const c = await getAuthedClient();
      const res = editing
        ? await c.put(`/academic/assignments/${editing.id}`, payload)
        : await c.post("/academic/assignments", payload);

      if (res.data.success) {
        toast.success(editing ? "Assignment updated" : "Assignment created");
        await load();
        setModalOpen(false);
      } else {
        toast.error("Operation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      const c = await getAuthedClient();
      const res = await c.delete(`/academic/assignments/${deleteTarget.id}`);
      if (res.data.success) {
        toast.success("Assignment deleted");
        setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    } finally {
      setSubmitting(false);
    }
  }

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SectionHeader
          title="Management"
          subtitle={`${assignments.length} assignments active`}
        />

        <div className="flex w-full items-center gap-3 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-2xl border-border/40 bg-muted/20 pl-10 focus-visible:ring-primary/20"
            />
          </div>
          <Button
            onClick={openCreate}
            className="h-11 shrink-0 rounded-2xl px-5 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="mr-2 size-4" />
            New Assignment
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 py-16 text-center">
            <BookOpen className="mb-4 size-10 text-muted-foreground/20" />
            <p className="text-sm font-medium text-muted-foreground/60">
              No assignments found
            </p>
          </div>
        ) : (
          filtered.map((assignment) => (
            <Card
              key={assignment.id}
              className="group overflow-hidden border-border/40 bg-card/50 transition-all hover:border-primary/30 hover:bg-muted/10"
            >
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="border-none bg-primary/10 text-primary hover:bg-primary/15"
                    >
                      {assignment.course?.name || "General"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-border/50 text-muted-foreground"
                    >
                      {assignment.rewardPoints ?? 0} XP
                    </Badge>
                    {Number(assignment.rewardCoins ?? 0) > 0 && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                      >
                        {assignment.rewardCoins} Coins
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold tracking-tight text-foreground">
                      {assignment.title}
                    </h3>
                    {assignment.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground/70">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Due {fmtDate(assignment.dueDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="size-3.5" />
                      {assignment._count?.submissions ?? 0} Submissions
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(assignment)}
                    className="h-9 rounded-xl border-border/40 bg-background px-4 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <Pencil className="mr-2 size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteTarget(assignment)}
                    className="size-9 rounded-xl border-border/40 bg-background text-muted-foreground hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
          onRemoveFile={() => {
            setSelectedFile(null);
            setForm({ ...form, file: undefined });
          }}
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
  );
}
