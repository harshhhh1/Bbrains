/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, GraduationCap, UserCheck, UserPlus, Upload, Trophy,
  ChevronRight, BookOpen, Loader2, Trash2, X, Shield
} from "lucide-react";
import { api, getAuthToken, getBaseUrl } from "@/services/api/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CrudDrawer } from "@/features/admin/components/CrudDrawer";
import { ManagerForm } from "@/app/(dashboard)/admin/users/_components/ManagerForm";
import { emptyManagerForm, type ManagerForm as ManagerFormType } from "@/app/(dashboard)/admin/users/_types";
import type { ApiUser } from "@/lib/types/api";

interface CollegeUsersManagementProps {
  collegeId: number;
  collegeName: string;
  initialCounts?: {
    students: number;
    teachers: number;
    admins: number;
  };
}

type TabType = "students" | "teachers" | "admins";

export function CollegeUsersManagement({
  collegeId,
  collegeName,
  initialCounts,
}: CollegeUsersManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>("students");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [counts, setCounts] = useState(initialCounts ?? { students: 0, teachers: 0, admins: 0 });

  // Add user drawer
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [addForm, setAddForm] = useState<ManagerFormType>(emptyManagerForm);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Import CSV
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    error?: { row: number; field: string; message: string };
  } | null>(null);

  // Achievement management
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);

  const fetchUsers = useCallback(async (tab: TabType) => {
    setLoadingUsers(true);
    try {
      const typeMap: Record<TabType, string> = {
        students: "student",
        teachers: "teacher",
        admins: "admin",
      };
      const res = await api.get<ApiUser[]>(
        `/user/${typeMap[tab]}s?collegeId=${collegeId}`
      );
      if (res.success) {
        setUsers(res.data || []);
      } else {
        toast.error(res.message || "Failed to load users");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [collegeId]);

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  const handleAddUser = async () => {
    if (!addForm.username || !addForm.email || !addForm.firstName || !addForm.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (addForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setAddSubmitting(true);
      const res = await api.post<ApiUser>("/user/managers", {
        username: addForm.username,
        email: addForm.email,
        password: addForm.password,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        sex: addForm.sex,
        dob: addForm.dob || "1995-01-01",
        phone: addForm.phone || undefined,
        bio: addForm.bio || undefined,
        collegeId: collegeId,
      });
      if (res.success) {
        toast.success("User created successfully");
        setShowAddDrawer(false);
        setAddForm({ ...emptyManagerForm, collegeId: String(collegeId) });
        fetchUsers(activeTab);
      } else {
        toast.error(res.message || "Failed to create user");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      e.target.value = "";
      return;
    }

    setImportSubmitting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("collegeId", String(collegeId));

      const token = await getAuthToken();
      const response = await fetch(`${getBaseUrl()}/user/batch-import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to import");

      setImportResult({ successCount: data.data?.count || 0 });
      toast.success(`Imported ${data.data?.count} users`);
      fetchUsers(activeTab);
    } catch (err: any) {
      setImportResult({
        successCount: 0,
        error: { row: 0, field: "unknown", message: err.message },
      });
      toast.error(err.message || "Import failed");
    } finally {
      setImportSubmitting(false);
      e.target.value = "";
    }
  };

  const loadAchievements = useCallback(async () => {
    setLoadingAchievements(true);
    try {
      const res = await api.get<any[]>("/achievements");
      if (res.success) setAchievements(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAchievements(false);
    }
  }, []);

  const handleAwardAchievement = async (achievementId: string, userId: string) => {
    try {
      const res = await api.post(`/achievements/${achievementId}/unlock/${userId}`, {});
      if (res.success) {
        toast.success("Achievement awarded!");
      } else {
        toast.error(res.message || "Failed to award");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to award achievement");
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "students", label: "Students", icon: <GraduationCap className="size-4" />, count: counts.students },
    { id: "teachers", label: "Teachers", icon: <BookOpen className="size-4" />, count: counts.teachers },
    { id: "admins", label: "Admins", icon: <Shield className="size-4" />, count: counts.admins },
  ];

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage all users belonging to <span className="font-semibold text-foreground">{collegeName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAchievements(true);
              loadAchievements();
            }}
          >
            <Trophy className="mr-2 size-4 text-amber-500" />
            Achievements
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="mr-2 size-4" />
            Import CSV
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAddForm({ ...emptyManagerForm, collegeId: String(collegeId) });
              setShowAddDrawer(true);
            }}
          >
            <UserPlus className="mr-2 size-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md ${
              activeTab === tab.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/60 bg-card"
            }`}
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${
              activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {tab.icon}
            </div>
            <p className="text-2xl font-bold tabular-nums">{tab.count}</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              {tab.label}
              <ChevronRight className={`size-3 transition-transform ${activeTab === tab.id ? "translate-x-0.5 text-primary" : ""}`} />
            </p>
          </button>
        ))}
      </div>

      {/* User list */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {tabs.find(t => t.id === activeTab)?.icon}
            {tabs.find(t => t.id === activeTab)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
              <Users className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No {activeTab} found in this college.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {user.userDetails?.firstName?.[0] ?? user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {user.userDetails?.firstName} {user.userDetails?.lastName}
                        {(!user.userDetails?.firstName && !user.userDetails?.lastName) && (
                          <span className="text-muted-foreground">@{user.username}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {user.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Drawer */}
      <CrudDrawer
        open={showAddDrawer}
        onClose={() => !addSubmitting && setShowAddDrawer(false)}
        title="Add User to College"
        description={`Create an account assigned to ${collegeName}`}
        onSubmit={handleAddUser}
        submitting={addSubmitting}
        submitLabel="Create User"
      >
        <ManagerForm
          form={addForm}
          onChange={setAddForm}
          disabled={addSubmitting}
        />
      </CrudDrawer>

      {/* Import CSV Dialog */}
      {importDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !importSubmitting && setImportDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-8 text-white shadow-2xl">
            <div className="mb-6 flex items-start justify-between border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-bold">Import Users via CSV</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Users will be imported into <span className="font-semibold text-white">{collegeName}</span>
                </p>
              </div>
              <button
                onClick={() => !importSubmitting && setImportDialogOpen(false)}
                className="rounded-full p-1.5 hover:bg-white/5"
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs">
              <p className="mb-2 font-bold uppercase tracking-wider text-primary">Required Columns</p>
              <div className="flex flex-wrap gap-2">
                {["firstname", "lastname", "email", "type: student/teacher", "sex", "dob: YYYY-MM-DD", "courseId"].map(c => (
                  <code key={c} className="rounded bg-black/40 px-2.5 py-1 font-mono text-[10px] text-gray-300 whitespace-nowrap">{c}</code>
                ))}
              </div>
              <p className="mb-2 mt-4 font-bold uppercase tracking-wider text-gray-500">Optional Columns</p>
              <div className="grid grid-cols-3 gap-1.5">
                {["user_id", "phone", "addressLine1", "city", "country"].map(c => (
                  <code key={c} className="rounded border border-dashed border-white/10 bg-black/20 px-2 py-1 font-mono text-gray-500">{c}</code>
                ))}
              </div>
              <p className="mt-3 text-gray-600">Leave a cell empty to let the system set it to null. Columns can be in any order.</p>
            </div>

            {importResult ? (
              <div className={`mb-4 rounded-xl border p-4 ${
                importResult.error
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}>
                <p className="font-bold">
                  {importResult.error ? "Import Failed" : `${importResult.successCount} users imported`}
                </p>
                {importResult.error && (
                  <p className="mt-1 text-sm opacity-80">{importResult.error.message}</p>
                )}
              </div>
            ) : null}

            <div className="relative rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center hover:border-primary/40 transition-colors">
              <input
                type="file"
                id={`csv-import-${collegeId}`}
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
                disabled={importSubmitting}
              />
              <label htmlFor={`csv-import-${collegeId}`} className="cursor-pointer flex flex-col items-center gap-3">
                {importSubmitting ? (
                  <Loader2 className="size-10 animate-spin text-primary" />
                ) : (
                  <Upload className="size-10 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-400">
                  {importSubmitting ? "Importing..." : "Click to select CSV file"}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Manager Dialog */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAchievements(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111111] p-8 text-white shadow-2xl max-h-[80vh] flex flex-col">
            <div className="mb-6 flex items-start justify-between border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="size-5 text-amber-500" />
                  Achievement Manager
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Award achievements to students in <span className="font-semibold text-white">{collegeName}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAchievements(false)}
                className="rounded-full p-1.5 hover:bg-white/5"
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {loadingAchievements ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : achievements.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2">
                  <Trophy className="size-8 text-gray-700" />
                  <p className="text-sm text-gray-500">No achievements found</p>
                </div>
              ) : (
                achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-lg">
                        {ach.icon ? (
                          <img src={ach.icon} className="size-5 object-contain" alt="" />
                        ) : (
                          <Trophy className="size-4 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ach.name}</p>
                        <p className="text-xs text-gray-500">
                          {ach.category} • {ach.requiredXp} XP
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                        T{ach.tier ?? 1}
                      </span>
                      {users.length > 0 && (
                        <select
                          className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-gray-300 focus:border-primary/50 focus:outline-none"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAwardAchievement(ach.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Award to...</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.userDetails?.firstName || u.username} {u.userDetails?.lastName || ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
