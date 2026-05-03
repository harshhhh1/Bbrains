import { useCallback, useState } from 'react'
import { UploadCloud, File } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface UploadZoneProps {
  onUpload: (file: File) => void
  canEdit: boolean
}

export function UploadZone({ onUpload, canEdit }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => onUpload(file))
  }, [onUpload])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    noClick: !canEdit,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  })

  if (!canEdit) return null

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {isDragging ? 'Drop files here' : 'Drag & drop files here, or click to select'}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Supports all file types, max 50MB per file
      </p>
    </div>
  )
}
