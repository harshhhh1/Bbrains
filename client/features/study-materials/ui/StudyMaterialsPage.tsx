'use client'

import { useState, useMemo, useRef } from 'react'
import { FolderPlus, Upload, AlertCircle, RefreshCw, Search, LayoutGrid, List } from 'lucide-react'
import { useStudyMaterials } from '../hooks/useStudyMaterials'
import { BreadcrumbNav } from './BreadcrumbNav'
import { MaterialsGrid } from './MaterialsGrid'
import { UploadZone } from './UploadZone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface StudyMaterialsPageProps {
  collegeId?: string
  courseId?: string
}

export function StudyMaterialsPage({ collegeId, courseId }: StudyMaterialsPageProps) {
  const { toast } = useToast()
  const {
    folders,
    files,
    currentPrefix,
    breadcrumbs,
    isLoading,
    error,
    canEdit,
    navigateToFolder,
    navigateBack,
    uploadFile,
    deleteItem,
    renameItem,
    getDownloadUrl,
    reload
  } = useStudyMaterials(collegeId, courseId)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')


  // Dialog states
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newName, setNewName] = useState('')
  const [targetPath, setTargetPath] = useState('')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filtered materials
  const filteredFolders = useMemo(() => 
    folders.filter(f => (f.displayName || f.name).toLowerCase().includes(searchQuery.toLowerCase())),
    [folders, searchQuery]
  )

  const filteredFiles = useMemo(() => 
    files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [files, searchQuery]
  )

  // Handle upload
  const handleUpload = async (file: File) => {
    const success = await uploadFile(file)
    if (success) {
      toast({ title: 'File uploaded successfully' })
    } else {
      toast({ title: 'Upload failed', variant: 'destructive' })
    }
  }

  // Handle download
  const handleDownload = async (path: string) => {
    const url = await getDownloadUrl(path)
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = path.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Handle rename
  const handleRename = async () => {
    if (!targetPath || !newName) return
    
    const isFolder = targetPath.endsWith('/')
    const parts = targetPath.split('/').filter(Boolean)
    parts.pop() // Remove the old name
    
    const parentPath = parts.join('/')
    let newFullPath = parentPath ? `${parentPath}/${newName}` : newName
    
    if (isFolder) {
      newFullPath += '/'
    }
    
    const success = await renameItem(targetPath, newFullPath)
    if (success) {
      toast({ title: 'Renamed successfully' })
      setIsRenameDialogOpen(false)
    } else {
      toast({ title: 'Rename failed', variant: 'destructive' })
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!targetPath) return
    const success = await deleteItem(targetPath)
    if (success) {
      toast({ title: 'Deleted successfully' })
      setIsDeleteDialogOpen(false)
    } else {
      toast({ title: 'Delete failed', variant: 'destructive' })
    }
  }

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName) return
    // Create empty file to represent folder
    const success = await uploadFile(new File([], '.keep'), `${currentPrefix}${newFolderName}/`)
    if (success) {
      toast({ title: 'Folder created successfully' })
      setIsCreateFolderDialogOpen(false)
      setNewFolderName('')
    } else {
      toast({ title: 'Folder creation failed', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b bg-dashboard-surface backdrop-blur-sm sticky top-0 z-10">
        <div className="relative w-full md:w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in materials..."
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
{/* 
          <Button variant="outline" size="sm" onClick={reload} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button> */}

          {canEdit && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button size="sm" onClick={() => setIsCreateFolderDialogOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <Button 
                size="sm" 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach(file => handleUpload(file))
                  }
                }}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-dashboard-surface">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <BreadcrumbNav breadcrumbs={breadcrumbs} onNavigate={navigateToFolder} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 flex items-center border border-destructive/20">
            <AlertCircle className="h-5 w-5 mr-3" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Upload Zone */}
        {canEdit && !isLoading && !searchQuery && (
          <div className="mb-8">
            <UploadZone onUpload={handleUpload} canEdit={canEdit} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Fetching your materials...</p>
          </div>
        )}

        {/* Unified Materials Grid */}
        {!isLoading && (
          <MaterialsGrid
            folders={filteredFolders}
            files={filteredFiles}
            selectedPath={selectedPath || undefined}
            onSelect={(path) => setSelectedPath(path)}
            onNavigate={navigateToFolder}
            onDownload={handleDownload}
            onRename={(path, name) => {
              setTargetPath(path)
              setNewName(name.replace(/\/$/, ''))
              setIsRenameDialogOpen(true)
            }}
            onDelete={(path) => {
              setTargetPath(path)
              setIsDeleteDialogOpen(true)
            }}
          />
        )}
      </div>


      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New name"
              className="focus-visible:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} className="bg-blue-600 hover:bg-blue-700">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{targetPath.split('/').pop()}"</span>? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="focus-visible:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700">
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
