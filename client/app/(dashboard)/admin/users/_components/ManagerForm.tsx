"use client";

import React from "react";
import { FormInput, FormSelect } from "@/features/admin/components/form";
import type { ManagerForm as ManagerFormType } from "../_types";

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

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <FormSelect
          label="User Type"
          required
          value={form.type}
          onChange={(value) => onChange({ ...form, type: value })}
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
        onChange={(e) => onChange({ ...form, username: e.target.value })}
        placeholder="username"
        disabled={disabled}
      />
      <FormInput
        label="Email"
        required
        type="email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
        placeholder="user@school.edu"
        disabled={disabled}
      />
      <FormInput
        label="Temporary Password"
        required
        type="password"
        value={form.password}
        onChange={(e) => onChange({ ...form, password: e.target.value })}
        placeholder="Minimum 8 characters"
        disabled={disabled}
      />
      <FormInput
        label="Confirm Password"
        required
        type="password"
        value={form.confirmPassword}
        onChange={(e) => onChange({ ...form, confirmPassword: e.target.value })}
        placeholder="Repeat password"
        disabled={disabled}
      />
      <FormInput
        label="First Name"
        required
        value={form.firstName}
        onChange={(e) => onChange({ ...form, firstName: e.target.value })}
        placeholder="First"
        disabled={disabled}
      />
      <FormInput
        label="Last Name"
        required
        value={form.lastName}
        onChange={(e) => onChange({ ...form, lastName: e.target.value })}
        placeholder="Last"
        disabled={disabled}
      />
      <FormSelect
        label="Sex"
        value={form.sex}
        onChange={(value) => onChange({ ...form, sex: value })}
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
        onChange={(e) => onChange({ ...form, dob: e.target.value })}
        disabled={disabled}
      />
      <FormInput
        label="Phone"
        value={form.phone}
        onChange={(e) => onChange({ ...form, phone: e.target.value })}
        placeholder="+91 ..."
        disabled={disabled}
      />

      {form.type === "student" && (
        <div className="col-span-2">
          <FormSelect
            label="Enrolled Course"
            required
            value={form.classId}
            onChange={(value) => onChange({ ...form, classId: value })}
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
            onChange={(e) => onChange({ ...form, teacherSubjects: e.target.value })}
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
            onChange={(e) => onChange({ ...form, bio: e.target.value })}
            placeholder="Brief note about the user"
            disabled={disabled}
          />
        </div>
      )}

      <div className="col-span-2 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Roles (Multi-select)</label>
        <div className="grid grid-cols-2 gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={form.roleIds.includes(role.id)}
                onChange={() => handleRoleToggle(role.id)}
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

      <p className="col-span-2 text-xs text-muted-foreground border-t border-white/5 pt-4">
        Users created here will receive an email (if configured) or can be provided with their temporary credentials manually.
      </p>
    </div>
  );
}
