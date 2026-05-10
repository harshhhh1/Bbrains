/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddCollegeModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdCollegeId, setCreatedCollegeId] = useState(null);

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

  const onSubmitCollege = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/colleges", collegeData);
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to create college");
        return;
      }

      // Assuming response contains created college object
      const newCollegeId = res.data?.id || res.id;
      if (newCollegeId) {
        setCreatedCollegeId(newCollegeId);
        toast.success("College created successfully");
        setStep(2);
      } else {
        toast.error("Failed to get new college ID");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create college");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAdmin = async (e) => {
    e.preventDefault();
    if (!createdCollegeId) return;
    try {
      setLoading(true);
      const res = await api.post("/user/admins", {
        ...adminData,
        collegeId: createdCollegeId,
      });
      if (!res.success) {
        toast.error(res.message || res.error || "Failed to create admin");
        return;
      }

      toast.success("Admin assigned successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>
                  {step === 1 ? "Add New College" : "Assign Administrator"}
                </DrawerTitle>
                <DrawerDescription>
                  {step === 1
                    ? "Enter the college details. An admin will be created in the next step."
                    : "Create the primary administrator account for the new college."}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {step === 1 ? (
              <form
                id="add-college-form"
                onSubmit={onSubmitCollege}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    required
                    value={collegeData.name}
                    onChange={(e) =>
                      setCollegeData({ ...collegeData, name: e.target.value })
                    }
                    placeholder="University of X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNo">Registration Number</Label>
                  <Input
                    id="regNo"
                    required
                    value={collegeData.regNo}
                    onChange={(e) =>
                      setCollegeData({ ...collegeData, regNo: e.target.value })
                    }
                    placeholder="REG-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={collegeData.email}
                    onChange={(e) =>
                      setCollegeData({ ...collegeData, email: e.target.value })
                    }
                    placeholder="contact@univ.edu"
                  />
                </div>
              </form>
            ) : (
              <form
                id="add-admin-form"
                onSubmit={onSubmitAdmin}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={adminData.firstName}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={adminData.lastName}
                      onChange={(e) =>
                        setAdminData({ ...adminData, lastName: e.target.value })
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      required
                      value={adminData.username}
                      onChange={(e) =>
                        setAdminData({ ...adminData, username: e.target.value })
                      }
                      placeholder="johndoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select
                      onValueChange={(val) =>
                        setAdminData({ ...adminData, sex: val })
                      }
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    required
                    value={adminData.email}
                    onChange={(e) =>
                      setAdminData({ ...adminData, email: e.target.value })
                    }
                    placeholder="admin@univ.edu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={adminData.password}
                      onChange={(e) =>
                        setAdminData({ ...adminData, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      required
                      value={adminData.dob}
                      onChange={(e) =>
                        setAdminData({ ...adminData, dob: e.target.value })
                      }
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
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
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
