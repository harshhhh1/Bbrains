"use client";

import React from "react";
import { DataTable } from "@/features/admin/ui/DataTable";
import { RoleBadge } from "@/features/admin/ui/RoleBadge";
import { fullName } from "@/features/admin/teachers/types";

export function TeachersTable({ loading, data, onEdit, onDelete }) {
  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "userDetails",
      label: "Name",
      render: (r) => fullName(r.userDetails),
    },
    {
      key: "teacherSubjects",
      label: "Subjects",
      render: (r) => r.userDetails?.teacherSubjects?.join(", ") || "—",
    },
    {
      key: "classTeacherCourse",
      label: "Class Teacher",
      render: (r) =>
        r.classTeacherCourse
          ? `${r.classTeacherCourse.name}${r.classTeacherCourse.standard ? ` (${r.classTeacherCourse.standard})` : ""}`
          : "—",
    },
    { key: "type", label: "Type", render: (r) => <RoleBadge value={r.type} /> },
  ];

  return (
    <DataTable
      loading={loading}
      data={data}
      searchKeys={["username", "email"]}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
