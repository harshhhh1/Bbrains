"use client";

import React from "react";

export interface SubjectInfo {
  name: string;
  courses: string[];
}

interface SubjectSelectorProps {
  subjects: SubjectInfo[];
  selectedSubjects: string[];
  onChange: (subject: string) => void;
  disabled?: boolean;
}

export const SubjectSelector = ({ subjects, selectedSubjects, onChange, disabled }: SubjectSelectorProps) => (
  <div className="col-span-2 space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Teaching Subjects (Multi-select)</label>
    <div className="grid grid-cols-2 gap-2 bg-black/20 p-4 rounded-xl border border-white/5 max-h-64 overflow-y-auto">
      {subjects.map((subject) => (
        <label key={subject.name} className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-3 rounded-lg transition-colors border border-transparent hover:border-white/5">
          <input
            type="checkbox"
            checked={selectedSubjects.includes(subject.name)}
            onChange={() => onChange(subject.name)}
            disabled={disabled}
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{subject.name}</span>
            <span className="text-[10px] text-muted-foreground/60 truncate">{subject.courses.join(", ")}</span>
          </div>
        </label>
      ))}
      {subjects.length === 0 && <p className="text-xs text-gray-500 italic">No subjects found in courses.</p>}
    </div>
  </div>
);
