/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer, PageHeader } from "@/components/layout/page-primitives";
import { Toolbar } from "@/components/ui/toolbar";
import { CrudDrawer } from "@/features/admin/ui/CrudDrawer";
import { UserFilters } from "@/features/users/ui/UserFilters";
import { UsersGrid } from "@/features/users/ui/UsersGrid";
import { UserDetailsDrawer } from "@/features/users/ui/UserDetailsDrawer";
import { DeleteConfirmationDialog } from "@/features/users/ui/DeleteConfirmationDialog";
import { ManagerForm } from "@/features/users/ui/ManagerForm";
import { ImportUsersDialog } from "@/features/users/ui/ImportUsersDialog";
import { useUsersManagement } from "@/features/users/hooks/useUsersManagement";
import { useHasPermission } from "@/components/providers/permissions-provider";

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const pageCollegeId = searchParams.get("collegeId");
  const [mounted, setMounted] = useState(false);
  const canManageUser = useHasPermission("manage_user");

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
    }
  }, [pageCollegeId]);

  if (!mounted) return null;

  if (!canManageUser) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ShieldCheck className="size-10 text-destructive" />}
          title="Access Denied"
          description="You do not have permission to manage users."
          className="min-h-[calc(100vh-10rem)] border-0 bg-transparent"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer padding="spacious" gap="xl">
      <PageHeader
        title="Manage Users & Roles"
        description="Create accounts and manage custom role assignments in one place"
      />

      <Toolbar className="lg:flex-row lg:items-center lg:justify-between">
        <UserFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleAddUser}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Add User
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setImportDialogOpen(true)}
          >
            <ShieldCheck className="h-4 w-4" />
            Import Users
          </Button>
        </div>
      </Toolbar>

      <UsersGrid
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={setDeleteId}
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
        <ManagerForm form={form} onChange={setForm} disabled={submitting} roles={roles} courses={courses} isEditing={!!editingUser} />
      </CrudDrawer>



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
    </PageContainer>
  );
}
