"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AssessmentStudent } from "@/services/api/client";

interface AssessmentRow {
  studentId: string;
  marksObtained: string;
  remark: string;
}

interface GradingTableProps {
  students: AssessmentStudent[];
  rows: AssessmentRow[];
  maxMarks?: number;
  onRowChange: (studentId: string, key: "marksObtained" | "remark", value: string) => void;
}

function personName(student?: AssessmentStudent | null) {
  const full = `${student?.userDetails?.firstName || ""} ${student?.userDetails?.lastName || ""}`.trim();
  return full || student?.username || "Student";
}

export function GradingTable({
  students,
  rows,
  maxMarks,
  onRowChange
}: GradingTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-background">
      <Table className="table-fixed">
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[260px] font-black uppercase tracking-widest text-[10px]">Candidate</TableHead>
            <TableHead className="w-[160px] font-black uppercase tracking-widest text-[10px]">Score</TableHead>
            <TableHead className="min-w-[320px] font-black uppercase tracking-widest text-[10px]">Registry Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/40">
          {students.map((student) => {
            const row = rows.find((entry) => entry.studentId === student.id) || {
              studentId: student.id,
              marksObtained: "",
              remark: "",
            };

            return (
              <TableRow key={student.id} className="group hover:bg-muted/10 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-bold text-foreground text-sm">{personName(student)}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">@{student.username}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    max={maxMarks}
                    value={row.marksObtained}
                    onChange={(e) => onRowChange(student.id, "marksObtained", e.target.value)}
                    placeholder="0"
                    className="rounded-xl h-10 font-black bg-muted/20 border-border/40"
                  />
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <Textarea
                    value={row.remark}
                    onChange={(e) => onRowChange(student.id, "remark", e.target.value)}
                    placeholder="Optional feedback for the student..."
                    className="min-h-[76px] w-full min-w-0 resize-y rounded-xl bg-muted/20 border-border/40 text-sm font-medium"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
