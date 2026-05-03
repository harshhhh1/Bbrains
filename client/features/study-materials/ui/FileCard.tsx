import { FileText, FileImage, FileSpreadsheet, File, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { StudyMaterialFile } from '../types/study-materials.types'

interface FileCardProps {
  file: StudyMaterialFile
  isSelected?: boolean
  onSelect: (path: string | null) => void
  onDownload: (path: string) => void
  onRename: (path: string, currentName: string) => void
  onDelete: (path: string) => void
}

const FILE_ICONS: Record<string, React.ElementType> = {
  'application/pdf': FileText,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'default': File
}

function getFileIcon(mimetype: string): React.ElementType {
  return FILE_ICONS[mimetype] || FILE_ICONS.default
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function FileCard({ file, isSelected, onSelect, onDownload, onRename, onDelete }: FileCardProps) {
  const Icon = getFileIcon(file.metadata?.mimetype || '')
  const fileSize = formatFileSize(file.metadata?.size || 0)

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onSelect(file.path)
      }}
      className={cn(
        "group relative flex flex-col p-3 gap-2 border rounded-xl transition-all cursor-pointer overflow-hidden",
        isSelected 
          ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500/20" 
          : "bg-card hover:bg-accent/50 border-border"
      )}
    >
      <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center mb-1 group-hover:bg-muted/80 transition-colors">
        <Icon className="w-10 h-10 text-blue-500" />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {fileSize}
        </p>
      </div>

      <div className="flex items-center justify-end gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation()
            onDownload(file.path)
          }}
          title="Preview"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation()
            onDownload(file.path)
          }}
          title="Download"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onRename(file.path, file.name)
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
            e.stopPropagation()
            onDelete(file.path)
          }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
