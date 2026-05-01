/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BriefcaseBusiness, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, userApi } from "@/services/api/client";
import { getAuthToken, getBaseUrl } from "@/services/api/client";
import type { ApiUser } from "@/lib/types/api";
import { CrudDrawer } from "@/features/admin/components/CrudDrawer";
import { UserFilters } from "../_components/UserFilters";
import { UsersGrid } from "../_components/UsersGrid";
import { UserRolesDialog } from "../_components/UserRolesDialog";
import { UserDetailsDrawer } from "../_components/UserDetailsDrawer";
import { DeleteConfirmationDialog } from "../_components/DeleteConfirmationDialog";
import { ManagerForm } from "../_components/ManagerForm";
import { ImportUsersDialog } from "../_components/ImportUsersDialog";
import { emptyManagerForm, hasManagerRole, type ManagerForm as ManagerFormType } from "../_types";

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const pageCollegeId = searchParams.get("collegeId");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<ApiUser | null>(null);
  const [form, setForm] = useState<ManagerFormType>(emptyManagerForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleDialogUser, setRoleDialogUser] = useState<ApiUser | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ successCount: number; error?: { row: number; field: string; message: string } } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isFixingRoles, setIsFixingRoles] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUsers();
    loadmetadata();
  }, []);

  const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      e.target.value = '';
      return;
    }

    setImportSubmitting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = await getAuthToken();
      const response = await fetch(`${getBaseUrl()}/users/batch-import`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to import users');
      }

      setImportResult({ successCount: responseData.data?.count || 0 });
      toast.success(`Successfully imported ${responseData.data?.count} users`);
      await loadUsers();
    } catch (error: any) {
      setImportResult({
        successCount: 0,
        error: {
          row: 0,
          field: 'unknown',
          message: error.message || 'Failed to import users'
        }
      });
      toast.error(error.message || 'Failed to import users');
    } finally {
      setImportSubmitting(false);
      e.target.value = '';
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiUser[]>("/roles/users");
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error(response.message || "Failed to load users");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadmetadata = async () => {
    try {
      const [rolesRes, coursesRes] = await Promise.all([
        api.get<any[]>("/roles"),
        api.get<any>("/courses")
      ]);

      if (rolesRes.success) setRoles(rolesRes.data || []);
      if (coursesRes.success) setCourses(coursesRes.data?.courses || []);
    } catch (error) {
      console.error("Failed to load metadata", error);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const firstName = user.userDetails?.firstName || "";
      const lastName = user.userDetails?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
      const query = search.toLowerCase();

      if (typeFilter === "manager" && !hasManagerRole(user)) return false;
      if (typeFilter !== "all" && typeFilter !== "manager" && user.type !== typeFilter) return false;

      if (
        query &&
        !fullName.includes(query) &&
        !user.username.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [search, typeFilter, users]);

  const handleFixRoles = async () => {
    try {
      setIsFixingRoles(true);
      const response = await userApi.fixRoles();
      if (response.success) {
        toast.success(`Roles fixed: ${response.data?.count || 0} users updated`);
        await loadUsers();
      } else {
        toast.error(response.message || "Failed to fix roles");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fix roles");
    } finally {
      setIsFixingRoles(false);
    }
  };

  function handleAddUser() {
    setForm(emptyManagerForm);
    setShowDialog(true);
  }

  async function handleCreateUser() {
    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please fill in the required manager details");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Temporary password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      let endpoint = "/user/staff";
      if (form.type === "student") endpoint = "/users/students";
      else if (form.type === "teacher") endpoint = "/users/teachers";
      else if (form.type === "admin") endpoint = "/user/admins";
      else if (form.type === "manager") endpoint = "/user/managers";

      const payload: any = {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        sex: form.sex,
        dob: form.dob || "1995-01-01",
        phone: form.phone || undefined,
        roleIds: form.roleIds,
        ...((pageCollegeId || form.collegeId) ? { collegeId: Number(pageCollegeId || form.collegeId) } : {}),
      };

      if (form.type === "student") {
        payload.classId = Number(form.classId);
      } else if (form.type === "teacher") {
        payload.teacherSubjects = form.teacherSubjects.split(",").map(s => s.trim()).filter(Boolean);
      } else if (form.type === "manager" || form.type === "admin" || form.type === "staff") {
        payload.bio = form.bio || undefined;
      }

      const response = await api.post<ApiUser>(endpoint, payload);

      if (response.success && response.data) {
        setUsers((prev) => [response.data as ApiUser, ...prev]);
        setShowDialog(false);
        toast.success(`${form.type.charAt(0).toUpperCase() + form.type.slice(1)} account created`);
      } else {
        toast.error(response.message || `Failed to create ${form.type}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to create ${form.type}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;

    try {
      const response = await api.delete(`/user/delete/${deleteId}`);
      if (response.success) {
        setUsers((prev) => prev.filter((user) => user.id !== deleteId));
        toast.success("User deleted");
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-12 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Users & Roles</h1>
          <p className="text-muted-foreground mt-1">Create accounts and manage custom role assignments in one place</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
        <UserFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddUser}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Add User
          </button>
          <button
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/90"
          >
            <ShieldCheck className="h-4 w-4" />
            Import Users
          </button>
        </div>
      </div>

      <UsersGrid
        users={filtered}
        loading={loading}
        onDelete={setDeleteId}
        onManageRoles={setRoleDialogUser}
        onView={(user) => {
          setSelectedUserDetails(user);
          setShowDetailsDrawer(true);
        }}
      />

      {mounted && (
        <>
          <UserDetailsDrawer
            open={showDetailsDrawer}
            onOpenChange={setShowDetailsDrawer}
            user={selectedUserDetails}
          />
          <CrudDrawer
            open={showDialog}
            onClose={() => !submitting && setShowDialog(false)}
            title={`Add ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
            description={`Create a new ${form.type} account with custom permissions.`}
            onSubmit={handleCreateUser}
            submitting={submitting}
            submitLabel={`Create ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
          >
            <ManagerForm form={form} onChange={setForm} disabled={submitting} roles={roles} courses={courses} />
          </CrudDrawer>

          <UserRolesDialog
            open={!!roleDialogUser}
            onOpenChange={(open) => !open && setRoleDialogUser(null)}
            userId={roleDialogUser?.id ?? null}
            username={roleDialogUser?.username ?? ""}
          />

          <DeleteConfirmationDialog
            open={!!deleteId}
            onOpenChange={(open) => !open && setDeleteId(null)}
            onConfirm={handleConfirmDelete}
          />

          <ImportUsersDialog
            open={importDialogOpen}
            onClose={() => setImportDialogOpen(false)}
            onImport={handleImportUsers}
            submitting={importSubmitting}
            progress={importProgress}
            result={importResult}
          />
        </>
      )}
    </div>
  );
}
