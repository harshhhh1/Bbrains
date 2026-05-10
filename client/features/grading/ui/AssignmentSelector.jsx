"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { BookOpen, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

function fmtDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssignmentSelector({ assignments, value, onChange, loading }) {
  const selected = assignments.find(
    (assignment) => String(assignment.id) === value,
  );
  const [inputValue, setInputValue] = useState("");

  // Update input value when selection changes from outside
  useEffect(() => {
    if (selected) {
      setInputValue(selected.title);
    } else {
      setInputValue("");
    }
  }, [selected]);

  return (
    <Combobox
      value={value}
      onValueChange={(nextValue) => {
        const newlySelected = assignments.find(
          (a) => String(a.id) === nextValue,
        );
        if (newlySelected) {
          setInputValue(newlySelected.title);
        }
        onChange(nextValue ?? "");
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <ComboboxInput
        placeholder={
          loading ? "Loading assignments..." : "Search assignments..."
        }
        disabled={loading}
        showClear
      >
        <ComboboxContent>
          <ComboboxList>
            {assignments.map((assignment) => (
              <ComboboxItem
                key={assignment.id}
                value={String(assignment.id)}
                label={assignment.title}
                textValue={assignment.title}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{assignment.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {assignment.course?.name ? (
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-3" />
                        {assignment.course.name}
                      </span>
                    ) : null}
                    {assignment.dueDate ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Due {fmtDate(assignment.dueDate)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ComboboxItem>
            ))}
            <ComboboxEmpty>No assignments found</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
      {selected ? (
        <div className="mt-2 text-xs text-muted-foreground">
          Selected:{" "}
          <span className="font-medium text-foreground">{selected.title}</span>
          {selected.course?.name ? ` • ${selected.course.name}` : ""}
        </div>
      ) : null}
    </Combobox>
  );
}
