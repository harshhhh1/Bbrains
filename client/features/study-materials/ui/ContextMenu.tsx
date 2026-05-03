import { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, Upload, FolderPlus } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  canEdit: boolean
  onRename: () => void
  onDelete: () => void
  onUpload: () => void
  onCreateFolder: () => void
  onClose: () => void
}

export function ContextMenu({
  x,
  y,
  canEdit,
  onRename,
  onDelete,
  onUpload,
  onCreateFolder,
  onClose
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl py-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      {canEdit && (
        <>
          <div className="px-2 py-1.5 mb-1 border-b border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Actions</p>
          </div>
          <button
            onClick={onUpload}
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent transition-colors mx-1 rounded-md w-[calc(100%-8px)]"
          >
            <Upload className="h-4 w-4 mr-3 text-blue-500" />
            Upload File
          </button>
          <button
            onClick={onCreateFolder}
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent transition-colors mx-1 rounded-md w-[calc(100%-8px)]"
          >
            <FolderPlus className="h-4 w-4 mr-3 text-blue-500" />
            New Folder
          </button>
          <div className="my-1 border-t border-border/50" />
          <button
            onClick={onRename}
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent transition-colors mx-1 rounded-md w-[calc(100%-8px)]"
          >
            <Pencil className="h-4 w-4 mr-3 text-muted-foreground" />
            Rename
          </button>
          <button
            onClick={onDelete}
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-destructive transition-colors mx-1 rounded-md w-[calc(100%-8px)]"
          >
            <Trash2 className="h-4 w-4 mr-3 text-destructive/80" />
            Delete
          </button>
        </>
      )}
      {!canEdit && (
        <div className="px-4 py-3 text-sm text-muted-foreground italic">
          View only access
        </div>
      )}
    </div>
  )
}
