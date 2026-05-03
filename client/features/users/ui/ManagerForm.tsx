"use client";

import React from "react";
import { FormInput, FormSelect } from "@/features/admin/ui/form";
import type { ManagerForm as ManagerFormType } from "@/features/users/types";
import { RoleSelector } from "./manager/RoleSelector";
import { SubjectSelector, type SubjectInfo } from "./manager/SubjectSelector";

interface ManagerFormProps {
  form: ManagerFormType;
  onChange: (form: ManagerFormType) => void;
  disabled?: boolean;
  roles?: any[];
  courses?: any[];
}

export function ManagerForm({ form, onChange, disabled, roles = [], courses = [] }: ManagerFormProps) {
  const updateField = (field: keyof ManagerFormType, value: any) => {
    onChange({ ...form, [field]: value });
  };

  const handleRoleToggle = (roleId: number) => {
    const nextRoles = form.roleIds.includes(roleId)
      ? form.roleIds.filter((id) => id !== roleId)
      : [...form.roleIds, roleId];
    updateField("roleIds", nextRoles);
  };

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = form.teacherSubjects.split(",").map(s => s.trim()).filter(Boolean);
    const nextSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    updateField("teacherSubjects", nextSubjects.join(", "));
  };

  const availableSubjects = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    courses.forEach(c => {
      if (Array.isArray(c.subjects)) {
        c.subjects.forEach((s: any) => {
          const trimmed = String(s || "").trim();
          if (trimmed) {
            if (!map.has(trimmed)) map.set(trimmed, new Set());
            map.get(trimmed)!.add(c.name);
          }
        });
      }
    });
    return Array.from(map.entries())
      .map(([name, courses]) => ({
        name,
        courses: Array.from(courses)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Account Identity */}
      <section className="space-y-4">
        <SectionHeader title="Account Identity" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormSelect
              label="User Type"
              required
              value={form.type}
              onChange={(value) => updateField("type", value)}
              options={[
                { value: "student", label: "Student" },
                { value: "teacher", label: "Teacher" },
                { value: "manager", label: "Manager" },
                { value: "admin", label: "Admin" },
              ]}
              disabled={disabled}
            />
          </div>
          <FormInput
            label="Username"
            required
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="username"
            disabled={disabled}
          />
          <FormInput
            label="Email"
            required
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="user@school.edu"
            disabled={disabled}
          />
        </div>
      </section>

      {/* Security */}
      <section className="space-y-4">
        <SectionHeader title="Security" />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Temporary Password"
            required
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Minimum 8 characters"
            disabled={disabled}
          />
          <FormInput
            label="Confirm Password"
            required
            type="password"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            placeholder="Repeat password"
            disabled={disabled}
          />
        </div>
      </section>

      {/* Profile Details */}
      <section className="space-y-4">
        <SectionHeader title="Profile Details" />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            required
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="First"
            disabled={disabled}
          />
          <FormInput
            label="Last Name"
            required
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Last"
            disabled={disabled}
          />
          <FormSelect
            label="Sex"
            value={form.sex}
            onChange={(value) => updateField("sex", value)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            disabled={disabled}
          />
          <FormInput
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={(e) => updateField("dob", e.target.value)}
            disabled={disabled}
          />
          <div className="col-span-2">
            <FormInput
              label="Phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 ..."
              disabled={disabled}
            />
          </div>
        </div>
      </section>

      {/* Assignment & Permissions */}
      <section className="space-y-4">
        <SectionHeader title="Assignment & Permissions" />
        <div className="grid grid-cols-2 gap-4">
          {(form.type === "student" || form.type === "teacher") && (
            <div className="col-span-2">
              <FormSelect
                label={form.type === "student" ? "Enrolled Course" : "Assigned Class (Class Teacher)"}
                required={form.type === "student"}
                value={form.classId}
                onChange={(value) => updateField("classId", value)}
                options={courses.map((c) => ({
                  value: String(c.id),
                  label: `${c.standard} - ${c.name}`,
                }))}
                disabled={disabled}
              />
            </div>
          )}

          {form.type === "teacher" && (
            <SubjectSelector 
              subjects={availableSubjects} 
              selectedSubjects={form.teacherSubjects.split(",").map(s => s.trim()).filter(Boolean)} 
              onChange={handleSubjectToggle}
              disabled={disabled}
            />
          )}

          {(form.type === "manager" || form.type === "admin" || form.type === "staff") && (
            <div className="col-span-2">
              <FormInput
                label="Bio / Professional Note"
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Brief note about the user"
                disabled={disabled}
              />
            </div>
          )}

          <RoleSelector 
            roles={roles} 
            selectedRoleIds={form.roleIds} 
            onChange={handleRoleToggle} 
            disabled={disabled} 
          />
        </div>
      </section>
    </div>
  );
}

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">
    {title}
  </h3>
);
