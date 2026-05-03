/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { CrudDrawer } from "@/features/admin/ui/CrudDrawer";
import { UserFilters } from "@/features/users/ui/UserFilters";
import { UsersGrid } from "@/features/users/ui/UsersGrid";
import { UserRolesDialog } from "@/features/users/ui/UserRolesDialog";
import { UserDetailsDrawer } from "@/features/users/ui/UserDetailsDrawer";
import { DeleteConfirmationDialog } from "@/features/users/ui/DeleteConfirmationDialog";
import { ManagerForm } from "@/features/users/ui/ManagerForm";
import { ImportUsersDialog } from "@/features/users/ui/ImportUsersDialog";
import { useUsersManagement } from "@/features/users/hooks/useUsersManagement";

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const pageCollegeId = searchParams.get("collegeId");
  const [mounted, setMounted] = useState(false);

  const {
    users,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    showDialog,
    setShowDialog,
    showDetailsDrawer,
    setShowDetailsDrawer,
    selectedUserDetails,
    setSelectedUserDetails,
    form,
    setForm,
    submitting,
    editingUser,
    deleteId,
    setDeleteId,
    roleDialogUser,
    setRoleDialogUser,
    importDialogOpen,
    setImportDialogOpen,
    importSubmitting,
    importProgress,
    importResult,
    roles,
    courses,
    handleImportUsers,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    handleConfirmDelete,
  } = useUsersManagement(pageCollegeId);

  useEffect(() => {
    setMounted(true);
    // Sync impersonation cookie with URL param for Superadmins
    if (pageCollegeId) {
      import("@/services/api/base").then(m => (m as any).setImpersonateCollegeId(pageCollegeId));
    } else {
      import("@/services/api/base").then(m => (m as any).setImpersonateCollegeId(null));
    }
  }, [pageCollegeId]);

  if (!mounted) return null;

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
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={setDeleteId}
        onManageRoles={setRoleDialogUser}
        onView={(user) => {
          setSelectedUserDetails(user);
          setShowDetailsDrawer(true);
        }}
      />

      <UserDetailsDrawer
        open={showDetailsDrawer}
        onOpenChange={setShowDetailsDrawer}
        user={selectedUserDetails}
      />

      <CrudDrawer
        open={showDialog}
        onClose={() => !submitting && setShowDialog(false)}
        title={editingUser ? `Edit ${editingUser.userDetails?.firstName}'s Profile` : `Add ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
        description={editingUser ? "Update user details and assigned subjects." : `Create a new ${form.type} account with custom permissions.`}
        onSubmit={handleSaveUser}
        submitting={submitting}
        submitLabel={editingUser ? "Save Changes" : `Create ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
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
    </div>
  );
}
