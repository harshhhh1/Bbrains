/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Building2,
  Hash,
  Mail,
  MapPin,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api/client";
import { toast } from "sonner";

export function CollegeInfoCard({ college, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: college.name || "",
    email: college.email || "",
    regNo: college.regNo || "",
    address: {
      addressLine1: college.address?.addressLine1 || "",
      addressLine2: college.address?.addressLine2 || "",
      city: college.address?.city || "",
      state: college.address?.state || "",
      postalCode: college.address?.postalCode || "",
      country: college.address?.country || "India",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/colleges/${college.id}`, formData);
      if (res.success) {
        toast.success("College details updated successfully");
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(res.message || "Failed to update college");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: college.name || "",
      email: college.email || "",
      regNo: college.regNo || "",
      address: {
        addressLine1: college.address?.addressLine1 || "",
        addressLine2: college.address?.addressLine2 || "",
        city: college.address?.city || "",
        state: college.address?.state || "",
        postalCode: college.address?.postalCode || "",
        country: college.address?.country || "India",
      },
    });
    setIsEditing(false);
  };

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          General Information
        </CardTitle>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="size-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4 text-emerald-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="size-4 text-destructive" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">College Name</p>
            {isEditing ? (
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <p className="font-medium text-lg">{college.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                <Hash className="size-3" /> Registration No
              </p>
              {isEditing ? (
                <Input
                  name="regNo"
                  value={formData.regNo}
                  onChange={handleChange}
                />
              ) : (
                <p className="font-medium">{college.regNo}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                <Mail className="size-3" /> Email
              </p>
              {isEditing ? (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <p className="font-medium break-all">{college.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/40">
            <p className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Address Details
            </p>

            {isEditing ? (
              <div className="grid gap-3">
                <Input
                  name="address.addressLine1"
                  placeholder="Address Line 1"
                  value={formData.address.addressLine1}
                  onChange={handleChange}
                />

                <Input
                  name="address.addressLine2"
                  placeholder="Address Line 2 (Optional)"
                  value={formData.address.addressLine2}
                  onChange={handleChange}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="address.city"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleChange}
                  />

                  <Input
                    name="address.state"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="address.postalCode"
                    placeholder="Postal Code"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                  />

                  <Input
                    name="address.country"
                    placeholder="Country"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div>
                {college.address ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {college.address.addressLine1}
                    </p>
                    {college.address.addressLine2 && (
                      <p>{college.address.addressLine2}</p>
                    )}
                    <p>
                      {college.address.city}, {college.address.state} -{" "}
                      {college.address.postalCode}
                    </p>
                    <p>{college.address.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No address provided
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
