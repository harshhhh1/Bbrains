"use client";

import { DataTable } from "@/features/admin/ui/DataTable";
import { fullName, fmtCurrency } from "@/features/admin/students/types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function StudentsTable({ loading, data, onEdit, onDelete, onView }) {
  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "userDetails",
      label: "Name",
      render: (r) => fullName(r.userDetails),
    },
    {
      key: "class",
      label: "Class",
      render: (r) => {
        const enrolledClass = r.enrollments?.[0]?.course;
        return enrolledClass
          ? `${enrolledClass.name}${enrolledClass.standard ? ` (${enrolledClass.standard})` : ""}`
          : "—";
      },
    },
    {
      key: "xp",
      label: "Level",
      render: (r) =>
        r.xp ? `Lv ${r.xp?.level ?? 1} (${r.xp?.xp ?? 0} XP)` : "—",
    },
    {
      key: "wallet",
      label: "Balance",
      render: (r) => (r.wallet ? fmtCurrency(r.wallet.balance) : "—"),
    },
  ];

  return (
    <DataTable
      loading={loading}
      data={data}
      searchKeys={["username", "email"]}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      extraActions={(r) =>
        onView && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onView(r)}
          >
            <Eye className="size-3.5" />
          </Button>
        )
      }
    />
  );
}
