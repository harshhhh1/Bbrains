import { FolderCard } from './FolderCard'
import { FileCard } from './FileCard'
import { Grid, Stack } from '@/components/layout/page-primitives'
import { EmptyState } from '@/components/ui/empty-state'
import { FilePlus2 } from 'lucide-react'
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
    <Stack gap="xl" onClick={() => onSelect(null)}>
      {/* Folders Section */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-1">Folders</h3>
          <Grid className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          </Grid>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-1">Files</h3>
          <Grid className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          </Grid>
        </div>
      )}

      {folders.length === 0 && files.length === 0 && (
        <EmptyState
          icon={<FilePlus2 className="size-12" />}
          title="Empty folder"
          description="Upload files or create folders to get started."
          className="py-20"
        />
      )}
    </Stack>
  )
}
