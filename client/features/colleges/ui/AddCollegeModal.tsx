/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Grid, Stack } from "@/components/layout/page-primitives";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { DrawerShell } from "@/components/ui/drawer-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api/client";

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCollegeModal({ isOpen, onClose, onSuccess }: AddCollegeModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [createdCollegeId, setCreatedCollegeId] = useState<number | null>(null);

  const [collegeData, setCollegeData] = useState({
    name: "",
    email: "",
    regNo: "",
  });

  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    sex: "other",
    dob: "1990-01-01",
    phone: "",
  });

  const onSubmitCollege = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post("/colleges", collegeData);

      if (!res.success) {
        toast.error(res.message || res.error || "Failed to create college");
        return;
      }

      const newCollegeId = (res as any).data?.id || (res as any).id;
      if (newCollegeId) {
        setCreatedCollegeId(newCollegeId);
        toast.success("College created successfully");
        setStep(2);
      } else {
        toast.error("Failed to get new college ID");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create college");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCollegeId) return;

    try {
      setLoading(true);
      const res = await api.post("/user/admins", { ...adminData, collegeId: createdCollegeId });

      if (!res.success) {
        toast.error(res.message || res.error || "Failed to create admin");
        return;
      }

      toast.success("Admin assigned successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerShell
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={step === 1 ? "Add New College" : "Assign Administrator"}
      description={
        step === 1
          ? "Enter the college details. An admin will be created in the next step."
          : "Create the primary administrator account for the new college."
      }
      bodyClassName="space-y-6"
      footer={
        <>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
          {step === 1 ? (
            <Button type="submit" form="add-college-form" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Next Step
            </Button>
          ) : (
            <Button type="submit" form="add-admin-form" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Complete Registration
            </Button>
          )}
        </>
      }
    >
      {step === 1 ? (
        <form id="add-college-form" onSubmit={onSubmitCollege}>
          <Stack>
            <Stack gap="sm">
              <Label htmlFor="name">College Name</Label>
              <Input id="name" required value={collegeData.name} onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })} placeholder="University of X" />
            </Stack>
            <Stack gap="sm">
              <Label htmlFor="regNo">Registration Number</Label>
              <Input id="regNo" required value={collegeData.regNo} onChange={(e) => setCollegeData({ ...collegeData, regNo: e.target.value })} placeholder="REG-123456" />
            </Stack>
            <Stack gap="sm">
              <Label htmlFor="email">Official Email</Label>
              <Input id="email" type="email" required value={collegeData.email} onChange={(e) => setCollegeData({ ...collegeData, email: e.target.value })} placeholder="contact@univ.edu" />
            </Stack>
          </Stack>
        </form>
      ) : (
        <form id="add-admin-form" onSubmit={onSubmitAdmin}>
          <Stack>
            <Grid columns={2}>
              <Stack gap="sm">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={adminData.firstName} onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })} placeholder="John" />
              </Stack>
              <Stack gap="sm">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={adminData.lastName} onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })} placeholder="Doe" />
              </Stack>
            </Grid>

            <Grid columns={2}>
              <Stack gap="sm">
                <Label htmlFor="username">Username</Label>
                <Input id="username" required value={adminData.username} onChange={(e) => setAdminData({ ...adminData, username: e.target.value })} placeholder="johndoe" />
              </Stack>
              <Stack gap="sm">
                <Label htmlFor="sex">Sex</Label>
                <Select
                  onValueChange={(val) => setAdminData({ ...adminData, sex: val })}
                  defaultValue={adminData.sex}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Stack>
            </Grid>

            <Stack gap="sm">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input id="adminEmail" type="email" required value={adminData.email} onChange={(e) => setAdminData({ ...adminData, email: e.target.value })} placeholder="admin@univ.edu" />
            </Stack>

            <Grid columns={2}>
              <Stack gap="sm">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={adminData.password} onChange={(e) => setAdminData({ ...adminData, password: e.target.value })} />
              </Stack>
              <Stack gap="sm">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" required value={adminData.dob} onChange={(e) => setAdminData({ ...adminData, dob: e.target.value })} />
              </Stack>
            </Grid>
          </Stack>
        </form>
      )}
    </DrawerShell>
  );
}
