import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { academicApi, api, userApi, getAuthToken, getBaseUrl } from "@/services/api/client";
import type { ApiUser } from "@/lib/types/api";
import { emptyManagerForm, hasManagerRole, type ManagerForm as ManagerFormType } from "@/features/users/types";

export function useUsersManagement(pageCollegeId: string | null) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<ApiUser | null>(null);
  const [form, setForm] = useState<ManagerFormType>(emptyManagerForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleDialogUser, setRoleDialogUser] = useState<ApiUser | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ successCount: number; error?: { row: number; field: string; message: string } } | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isFixingRoles, setIsFixingRoles] = useState(false);

  const loadUsers = useCallback(async () => {
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
  }, []);

  const loadMetadata = useCallback(async () => {
    try {
      const [rolesRes, coursesRes] = await Promise.all([
        api.get<any[]>("/roles"),
        academicApi.getCourses({ params: { limit: 100 } })
      ]);

      if (rolesRes.success) setRoles(rolesRes.data || []);
      
      if (coursesRes.success) {
        const data = coursesRes.data as any;
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && typeof data === 'object' && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
        }
      } else {
        toast.error("Failed to load courses list");
      }
    } catch (error) {
      console.error("Failed to load metadata", error);
      toast.error("An unexpected error occurred while loading metadata");
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadMetadata();
  }, [loadUsers, loadMetadata, pageCollegeId]);

  const filteredUsers = useMemo(() => {
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
        error: { row: 0, field: 'unknown', message: error.message || 'Failed to import users' }
      });
      toast.error(error.message || 'Failed to import users');
    } finally {
      setImportSubmitting(false);
      e.target.value = '';
    }
  };

  const handleEditUser = (user: ApiUser) => {
    setEditingUser(user);
    setForm({
      ...emptyManagerForm,
      type: user.type,
      username: user.username,
      email: user.email,
      firstName: user.userDetails?.firstName || "",
      lastName: user.userDetails?.lastName || "",
      sex: user.userDetails?.sex || "other",
      bio: user.userDetails?.bio || "",
      classId: user.type === "student" 
        ? String(user.enrollments?.[0]?.courseId || "") 
        : user.type === "teacher"
          ? String(user.classTeacherCourse?.id || "")
          : "",
      teacherSubjects: (user.userDetails?.teacherSubjects || []).join(", "),
      roleIds: (user.roles || []).map(r => r.role?.id).filter(Boolean) as number[],
    });
    setShowDialog(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setForm(emptyManagerForm);
    setShowDialog(true);
  };

  const handleSaveUser = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please fill in the required details");
      return;
    }
    
    if (!editingUser) {
      if (form.password.length < 8) {
        toast.error("Temporary password must be at least 8 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload: any = {
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        sex: form.sex,
        dob: form.dob || "1995-01-01",
        phone: form.phone || undefined,
        roleIds: form.roleIds,
        ...(pageCollegeId ? { collegeId: Number(pageCollegeId) } : {}),
      };

      if (!editingUser) payload.password = form.password;

      if (form.type === "student" || form.type === "teacher") {
        payload.classId = form.classId ? Number(form.classId) : undefined;
      }
      
      if (form.type === "teacher") {
        payload.teacherSubjects = form.teacherSubjects.split(",").map(s => s.trim()).filter(Boolean);
      } else if (form.type === "manager" || form.type === "admin" || form.type === "staff") {
        payload.bio = form.bio || undefined;
      }

      let response;
      if (editingUser) {
        response = await userApi.updateProfile(editingUser.id, payload);
      } else {
        let endpoint = "/user/staff";
        if (form.type === "student") endpoint = "/users/students";
        else if (form.type === "teacher") endpoint = "/users/teachers";
        else if (form.type === "admin") endpoint = "/user/admins";
        else if (form.type === "manager") endpoint = "/user/managers";
        response = await api.post<ApiUser>(endpoint, payload);
      }

      if (response.success && response.data) {
        if (editingUser) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? (response.data as ApiUser) : u));
          toast.success("User profile updated");
        } else {
          setUsers((prev) => [response.data as ApiUser, ...prev]);
          toast.success(`${form.type.charAt(0).toUpperCase() + form.type.slice(1)} account created`);
        }
        setShowDialog(false);
      } else {
        toast.error(response.message || `Failed to save ${form.type}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to save ${form.type}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
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
  };

  return {
    users: filteredUsers,
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
    isFixingRoles,
    handleImportUsers,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    handleConfirmDelete,
    loadUsers
  };
}
