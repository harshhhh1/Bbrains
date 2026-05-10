"use client";

import { useCallback, useState } from "react";
import { $isTableSelection } from "@lexical/table";
import { $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const FORMATS = [
  { format: "bold", icon: BoldIcon, label: "Bold" },
  { format: "italic", icon: ItalicIcon, label: "Italic" },
  { format: "underline", icon: UnderlineIcon, label: "Underline" },
  { format: "strikethrough", icon: StrikethroughIcon, label: "Strikethrough" },
];

export function FontFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [activeFormats, setActiveFormats] = useState([]);

  const $updateToolbar = useCallback((selection) => {
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const formats = [];
      FORMATS.forEach(({ format }) => {
        if (selection.hasFormat(format)) {
          formats.push(format);
        }
      });
      setActiveFormats((prev) => {
        // Only update if formats have changed
        if (
          prev.length !== formats.length ||
          !formats.every((f) => prev.includes(f))
        ) {
          return formats;
        }
        return prev;
      });
    }
  }, []);

  useUpdateToolbarHandler($updateToolbar);

  return (
    <ToggleGroup
      type="multiple"
      value={activeFormats}
      onValueChange={setActiveFormats}
      variant="outline"
      size="sm"
    >
      {FORMATS.map(({ format, icon: Icon, label }) => (
        <ToggleGroupItem
          key={format}
          value={format}
          aria-label={label}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
          }}
        >
          <Icon className="size-4" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
