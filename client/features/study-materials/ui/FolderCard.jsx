import { Folder, Pencil, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FolderCard({
  folder,
  isSelected,
  onSelect,
  onNavigate,
  onRename,
  onDelete,
}) {
  const displayName = folder.displayName || folder.name;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(folder.prefix);
      }}
      className={cn(
        "group relative flex flex-col border rounded-xl transition-all cursor-pointer overflow-hidden",
        isSelected
          ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20"
          : "bg-card hover:bg-accent/50 border-border",
      )}
    >
      <div className="flex items-center p-3 gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600">
          <Folder className="w-6 h-6 fill-current" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={displayName}>
            {displayName}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/50 to-transparent">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(folder.prefix);
          }}
          title="Open"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onRename(folder.prefix, folder.name);
          }}
          title="Rename"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folder.prefix);
          }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
