"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

      // Assuming response contains created college object
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Add New College" : "Assign Administrator"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the college details. An admin will be created in the next step."
              : "Create the primary administrator account for the new college."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
            <form onSubmit={onSubmitCollege} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input id="name" required value={collegeData.name} onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })} placeholder="University of X" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNo">Registration Number</Label>
                <Input id="regNo" required value={collegeData.regNo} onChange={(e) => setCollegeData({ ...collegeData, regNo: e.target.value })} placeholder="REG-123456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input id="email" type="email" required value={collegeData.email} onChange={(e) => setCollegeData({ ...collegeData, email: e.target.value })} placeholder="contact@univ.edu" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Next Step
                </Button>
              </div>
            </form>
        ) : (
            <form onSubmit={onSubmitAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required value={adminData.firstName} onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required value={adminData.lastName} onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })} placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" required value={adminData.username} onChange={(e) => setAdminData({ ...adminData, username: e.target.value })} placeholder="johndoe" />
                </div>
                <div className="space-y-2">
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" required value={adminData.email} onChange={(e) => setAdminData({ ...adminData, email: e.target.value })} placeholder="admin@univ.edu" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={adminData.password} onChange={(e) => setAdminData({ ...adminData, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" required value={adminData.dob} onChange={(e) => setAdminData({ ...adminData, dob: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Complete Registration
                </Button>
              </div>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
