/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";

export function EditCollegeModal({ isOpen, onClose, onSuccess, collegeData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    regNo: "",
  });

  useEffect(() => {
    if (collegeData) {
      setFormData({
        name: collegeData.name || "",
        email: collegeData.email || "",
        regNo: collegeData.regNo || "",
      });
    }
  }, [collegeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    if (!formData.name || !formData.email || !formData.regNo) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/colleges/${collegeData.id}`, formData);
      if (!res.success) {
        toast.error(
          res.message || res.error || "Failed; to update college details.",
        );
        return;
      }

      toast.success("College updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
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
                <DrawerTitle>Edit College Profile</DrawerTitle>
                <DrawerDescription>
                  Update the contact and registry details of the institution.
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">College Name *</label>
                <Input
                  name="name"
                  placeholder="e.g. Oxford University"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Registration Number *
                </label>
                <Input
                  name="regNo"
                  placeholder="e.g. REG-2023-XYZ"
                  value={formData.regNo}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email *</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="admin@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DrawerClose>
            <Button onClick={onSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
