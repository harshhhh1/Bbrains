import { FolderCard } from './FolderCard'
import { FileCard } from './FileCard'
import type { StudyMaterialFolder, StudyMaterialFile } from '../types/study-materials.types'

interface MaterialsGridProps {
  folders: StudyMaterialFolder[]
  files: StudyMaterialFile[]
  selectedPath?: string
  onSelect: (path: string | null) => void
  onNavigate: (prefix: string) => void
  onDownload: (path: string) => void
  onRename: (path: string, currentName: string) => void
  onDelete: (path: string) => void
}

export function MaterialsGrid({
  folders,
  files,
  selectedPath,
  onSelect,
  onNavigate,
  onDownload,
  onRename,
  onDelete
}: MaterialsGridProps) {
  return (
    <div className="space-y-8" onClick={() => onSelect(null)}>
      {/* Folders Section */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-1">Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <FolderCard
                key={folder.prefix}
                folder={folder}
                isSelected={selectedPath === folder.prefix}
                onSelect={onSelect}
                onNavigate={onNavigate}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-1">Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.path}
                file={file}
                isSelected={selectedPath === file.path}
                onSelect={onSelect}
                onDownload={onDownload}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {folders.length === 0 && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="bg-muted rounded-full p-6 mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">Empty folder</p>
          <p className="text-sm">Upload files or create folders to get started.</p>
        </div>
      )}
    </div>
  )
}
