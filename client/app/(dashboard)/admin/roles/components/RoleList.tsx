"use client";

import { useState, useMemo } from "react";
import { Plus, Shield, Lock, Search, GripVertical } from "lucide-react";
import type { Role } from "../_types";
import { api } from "@/services/api/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

interface RoleListProps {
  roles: Role[];
  selectedRoleId: number | null;
  onSelectRole: (id: number) => void;
  collegeId: number | undefined;
  onRoleCreated: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

function SortableRoleItem({
  role,
  isSelected,
  isLocked,
  onSelect,
}: {
  role: Role;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSuperAdminRole = role.name.toLowerCase() === "superadmin";

  return (
    <div ref={setNodeRef} style={style} className="group">
      <button
        onClick={onSelect}
        className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors ${
          isSelected
            ? "bg-primary/10 text-primary"
            : isLocked
            ? "text-muted-foreground/50 opacity-70"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {!isLocked && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="size-3.5 text-muted-foreground/60" />
            </div>
          )}
          {isLocked && (
            <div className="w-5 flex items-center justify-center">
              <Lock className="size-3 text-muted-foreground/60" />
            </div>
          )}
          <div
            className="flex size-3 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: role.color || "#99aab5" }}
          >
            {isSuperAdminRole && <Shield className="size-2 text-background" />}
          </div>
          <span className="truncate text-sm font-medium">{role.name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {role.isDefault && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
              Default
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export default function RoleList({
  roles,
  selectedRoleId,
  onSelectRole,
  collegeId,
  onRoleCreated,
  userLowestPosition,
  isUserSuperAdmin,
}: RoleListProps) {
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateRole = async () => {
    if (!collegeId) return;
    setIsCreating(true);
    try {
      const maxPos = Math.max(...roles.map(r => r.position < 100 ? r.position : 0), 4);
      
      const res = await api.post<any>("/roles", {
        name: "New Role",
        color: "#99aab5",
        position: maxPos + 1,
      });

      if (!res.success) throw new Error(res.message);

      toast.success("Role created successfully");
      onRoleCreated();
      if (res.data) {
        onSelectRole(res.data.id);
      }
    } catch (err: any) {
      console.error("Failed to create role:", err);
      toast.error(err.message || "Failed to create role");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedRoles.findIndex((r) => r.id === active.id);
    const newIndex = sortedRoles.findIndex((r) => r.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const draggedRole = sortedRoles[oldIndex];

    // Hierarchy check for dragging
    if (draggedRole.name.toLowerCase() === "superadmin" && !isUserSuperAdmin) return;
    if (draggedRole.position <= userLowestPosition && !isUserSuperAdmin) return;

    const newOrder = arrayMove(sortedRoles, oldIndex, newIndex);

    setIsReordering(true);
    try {
      const updates = newOrder.map((role, index) => ({
        id: role.id,
        position: index + 1,
      }));

      await Promise.all(updates.map(u => 
        api.put(`/roles/${u.id}`, { position: u.position })
      ));

      toast.success("Order updated");
      onRoleCreated();
    } catch (err: any) {
      console.error("Failed to reorder roles:", err);
      toast.error("Failed to reorder roles");
    } finally {
      setIsReordering(false);
    }
  };

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.position - b.position),
    [roles]
  );

  const filteredRoles = useMemo(
    () => sortedRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [sortedRoles, search]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Roles
        </h2>
        <button
          onClick={handleCreateRole}
          disabled={isCreating}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Create Role"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search roles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-muted/50 py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border border-transparent focus:border-primary/20 transition-colors"
          />
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground/60" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 bg-background">


        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredRoles.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredRoles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const isSuperAdminRole = role.name.toLowerCase() === "superadmin";
              
              const isLocked =
                isSuperAdminRole ||
                (role.position <= userLowestPosition && !isUserSuperAdmin);

              return (
                <SortableRoleItem
                  key={role.id}
                  role={role}
                  isSelected={isSelected}
                  isLocked={isLocked}
                  onSelect={() => onSelectRole(role.id)}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
