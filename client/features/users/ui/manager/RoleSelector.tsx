"use client";

import React from "react";

interface RoleSelectorProps {
  roles: any[];
  selectedRoleIds: number[];
  onChange: (roleId: number) => void;
  disabled?: boolean;
}

export const RoleSelector = ({ roles, selectedRoleIds, onChange, disabled }: RoleSelectorProps) => (
  <div className="col-span-2 space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Roles (Multi-select)</label>
    <div className="grid grid-cols-2 gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
      {roles
        .filter((role) => role.name?.toLowerCase() !== "superadmin")
        .map((role) => (
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
