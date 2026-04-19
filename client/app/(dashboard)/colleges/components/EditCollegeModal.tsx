"use client";

import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";

interface EditCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collegeData: any;
}

export function EditCollegeModal({ isOpen, onClose, onSuccess, collegeData }: EditCollegeModalProps) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        toast.error(res.message || res.error || "Failed; to update college details.");
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit College Profile</DialogTitle>
          <DialogDescription>
            Update the contact and registry details of the institution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <label className="text-sm font-medium">Registration Number *</label>
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
