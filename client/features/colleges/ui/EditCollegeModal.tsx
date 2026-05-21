"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Stack } from "@/components/layout/page-primitives";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { DrawerShell } from "@/components/ui/drawer-shell";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api/client";

type EditableCollege = {
  id: number | string;
  name?: string;
  email?: string;
  regNo?: string;
};

interface EditCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collegeData: EditableCollege | null;
}

export function EditCollegeModal({ isOpen, onClose, onSuccess, collegeData }: EditCollegeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    regNo: "",
  });

  useEffect(() => {
    if (!collegeData) return;

    setFormData({
      name: collegeData.name || "",
      email: collegeData.email || "",
      regNo: collegeData.regNo || "",
    });
  }, [collegeData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async () => {
    if (!collegeData) return;

    if (!formData.name || !formData.email || !formData.regNo) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/colleges/${collegeData.id}`, formData);

      if (!res.success) {
        toast.error(res.message || res.error || "Failed to update college details.");
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
    <DrawerShell
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Edit College Profile"
      description="Update the contact and registry details of the institution."
      bodyClassName="space-y-6"
      footer={
        <>
          <DrawerClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={onSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </>
      }
    >
      <Stack>
        <Stack gap="sm">
          <label className="text-sm font-medium">College Name *</label>
          <Input
            name="name"
            placeholder="e.g. Oxford University"
            value={formData.name}
            onChange={handleChange}
          />
        </Stack>

        <Stack gap="sm">
          <label className="text-sm font-medium">Registration Number *</label>
          <Input
            name="regNo"
            placeholder="e.g. REG-2023-XYZ"
            value={formData.regNo}
            onChange={handleChange}
          />
        </Stack>

        <Stack gap="sm">
          <label className="text-sm font-medium">Contact Email *</label>
          <Input
            type="email"
            name="email"
            placeholder="admin@college.edu"
            value={formData.email}
            onChange={handleChange}
          />
        </Stack>
      </Stack>
    </DrawerShell>
  );
}
