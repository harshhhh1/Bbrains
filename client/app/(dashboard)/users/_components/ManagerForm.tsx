/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { FormInput, FormSelect } from "@/features/admin/components/form";
import type { ManagerForm as ManagerFormType } from "../_types";

interface RoleSelectorProps {
  roles: any[];
  selectedRoleIds: number[];
  onChange: (roleId: number) => void;
  disabled?: boolean;
}

const RoleSelector = ({ roles, selectedRoleIds, onChange, disabled }: RoleSelectorProps) => (
  <div className="col-span-2 space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Roles (Multi-select)</label>
    <div className="grid grid-cols-2 gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
      {roles.map((role) => (
        <label key={role.id} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={selectedRoleIds.includes(role.id)}
            onChange={() => onChange(role.id)}
            disabled={disabled}
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{role.name}</span>
            {role.description && <span className="text-[10px] text-gray-500 line-clamp-1">{role.description}</span>}
          </div>
        </label>
      ))}
      {roles.length === 0 && <p className="text-xs text-gray-500 italic">No custom roles found for this college.</p>}
    </div>
  </div>
);

interface ManagerFormProps {
  form: ManagerFormType;
  onChange: (form: ManagerFormType) => void;
  disabled?: boolean;
  roles?: any[];
  courses?: any[];
}

export function ManagerForm({ form, onChange, disabled, roles = [], courses = [] }: ManagerFormProps) {
  const handleRoleToggle = (roleId: number) => {
    const nextRoles = form.roleIds.includes(roleId)
      ? form.roleIds.filter((id) => id !== roleId)
      : [...form.roleIds, roleId];
    onChange({ ...form, roleIds: nextRoles });
  };

  const updateField = (field: keyof ManagerFormType, value: any) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Account Identity */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Account Identity</h3>
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
                { value: "staff", label: "Staff" },
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
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Security</h3>
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
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Profile Details</h3>
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

      {/* Role Specific */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Assignment & Permissions</h3>
        <div className="grid grid-cols-2 gap-4">
          {form.type === "student" && (
            <div className="col-span-2">
              <FormSelect
                label="Enrolled Course"
                required
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
            <div className="col-span-2">
              <FormInput
                label="Teaching Subjects (comma separated)"
                required
                value={form.teacherSubjects}
                onChange={(e) => updateField("teacherSubjects", e.target.value)}
                placeholder="Math, Science, English"
                disabled={disabled}
              />
            </div>
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

      <p className="text-xs text-muted-foreground border-t border-white/5 pt-4">
        Users created here will receive an email (if configured) or can be provided with their temporary credentials manually.
      </p>
    </div>
  );
}
