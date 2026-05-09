"use client";

import React from "react";
import { FormInput, FormSelect, FormTextarea } from "@/features/admin/ui/form";
import { Button } from "@/components/ui/button";
import { Paperclip, X as CloseIcon, Loader2 } from "lucide-react";
import type { ApiCourse } from "@/lib/types/api";

interface AssignmentFormValues {
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  file?: string;
}

interface AssignmentFormProps {
  form: AssignmentFormValues;
  onChange: (form: AssignmentFormValues) => void;
  courses: ApiCourse[];
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  isUploading: boolean;
  disabled?: boolean;
}

export function AssignmentForm({
  form,
  onChange,
  courses,
  selectedFile,
  onFileChange,
  onRemoveFile,
  isUploading,
  disabled
}: AssignmentFormProps) {
  const updateField = (field: keyof AssignmentFormValues, value: string) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Assignment Title"
        required
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="e.g. History Project, Math Quiz"
        disabled={disabled}
      />

      <FormSelect
        label="Assign to Class"
        required
        value={form.courseId}
        onChange={(val) => updateField("courseId", val)}
        options={[
          { value: "", label: "Select a class" },
          ...courses.map((c) => ({
            value: String(c.id),
            label: `${c.standard ? `${c.standard} - ` : ""}${c.name}`,
          }))
        ]}
        disabled={disabled}
      />

      <FormInput
        label="Due Date"
        required
        type="date"
        value={form.dueDate}
        onChange={(e) => updateField("dueDate", e.target.value)}
        disabled={disabled}
      />

      <FormTextarea
        label="Description / Instructions"
        value={form.description}
        onChange={(val) => updateField("description", val)}
        placeholder="Provide details about the assignment..."
        disabled={disabled}
        rows={4}
      />

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Attachment (Optional)
        </label>
        
        {form.file || selectedFile ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <Paperclip className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">
                {selectedFile ? selectedFile.name : "Existing Attachment"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onRemoveFile}
              disabled={disabled}
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              id="assignment-file"
              className="hidden"
              onChange={onFileChange}
              disabled={disabled || isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed py-6"
              onClick={() => document.getElementById("assignment-file")?.click()}
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : "Attach Document or Image"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
