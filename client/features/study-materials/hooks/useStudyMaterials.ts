import { useState, useCallback, useEffect } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useUser } from '@/hooks/use-user'
import type { StudyMaterialFolder, StudyMaterialFile, UserRole } from '../types/study-materials.types'
import {
  listMaterials,
  uploadMaterial,
  deleteMaterial,
  renameMaterial,
  getSignedUrl
} from '../api/study-materials.service'

export function useStudyMaterials(initialCollegeId?: string, initialCourseId?: string) {
  const { hasPermission } = usePermissions()
  const { user } = useUser()
  
  const [folders, setFolders] = useState<StudyMaterialFolder[]>([])
  const [files, setFiles] = useState<StudyMaterialFile[]>([])
  const [currentPrefix, setCurrentPrefix] = useState<string>('')
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; prefix: string; displayName?: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)

  // Check if user can edit (admin, manager, teacher)
  useEffect(() => {
    const userType = user?.type as UserRole
    const editableRoles: UserRole[] = ['admin', 'manager', 'superadmin', 'teacher']
    setCanEdit(userType ? editableRoles.includes(userType) : false)
  }, [user])

  // Load materials for current prefix
  const loadMaterials = useCallback(async (prefix: string, collegeId?: string, courseId?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await listMaterials(prefix, collegeId, courseId)
      if (res.success) {
        setFolders(res.data.folders as StudyMaterialFolder[])
        setFiles(res.data.files as StudyMaterialFile[])
        setCurrentPrefix(res.data.prefix)
        updateBreadcrumbs(res.data.prefix, res.data.breadcrumbNames)
      } else {
        setError('Failed to load materials')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update breadcrumbs based on current prefix
  const updateBreadcrumbs = useCallback((prefix: string, breadcrumbNames?: { name: string; displayName: string }[]) => {
    if (!prefix) {
      setBreadcrumbs([{ name: 'Root', prefix: '', displayName: 'Root' }])
      return
    }

    const parts = prefix.split('/').filter(Boolean)
    const crumbs = [{ name: 'Root', prefix: '', displayName: 'Root' }]
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath += `${part}/`
      const breadcrumbData = breadcrumbNames?.find(b => b.name === part)
      const displayName = breadcrumbData?.displayName || part
      crumbs.push({ name: part, prefix: currentPath, displayName })
    })

    setBreadcrumbs(crumbs)
  }, [])

  // Navigate into a folder
  const navigateToFolder = useCallback((folderPrefix: string) => {
    loadMaterials(folderPrefix)
  }, [loadMaterials])

  // Go back to parent folder
  const navigateBack = useCallback(() => {
    if (!currentPrefix) return
    const parts = currentPrefix.split('/').filter(Boolean)
    parts.pop() // Remove last part
    const parentPrefix = parts.length > 0 ? `${parts.join('/')}/` : ''
    loadMaterials(parentPrefix)
  }, [currentPrefix, loadMaterials])

  // Upload file
  const uploadFile = useCallback(async (file: File, prefix?: string) => {
    try {
      const res = await uploadMaterial(prefix || currentPrefix, file)
      if (res.success) {
        loadMaterials(currentPrefix) // Reload current folder
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return false
    }
  }, [currentPrefix, loadMaterials])

  // Delete file or folder
  const deleteItem = useCallback(async (path: string) => {
    try {
      const res = await deleteMaterial(path)
      if (res.success) {
        loadMaterials(currentPrefix) // Reload current folder
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      return false
    }
  }, [currentPrefix, loadMaterials])

  // Rename file or folder
  const renameItem = useCallback(async (oldPath: string, newPath: string) => {
    try {
      const res = await renameMaterial(oldPath, newPath)
      if (res.success) {
        loadMaterials(currentPrefix) // Reload current folder
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rename failed')
      return false
    }
  }, [currentPrefix, loadMaterials])

  // Get signed URL for download
  const getDownloadUrl = useCallback(async (path: string) => {
    try {
      const res = await getSignedUrl(path)
      return res.signedUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get download URL')
      return null
    }
  }, [])

  // Initialize with college/course ID - use refs to avoid dependency issues
  useEffect(() => {
    if (!user || !initialCollegeId) return
    
    // For students, wait until courseId is available
    if (user.type === 'student' && !initialCourseId) {
      return
    }
    
    const prefix = initialCourseId 
      ? `${initialCollegeId}/${initialCourseId}/` 
      : `${initialCollegeId}/`
    loadMaterials(prefix, initialCollegeId, initialCourseId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCollegeId, initialCourseId])

  return {
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
    reload: () => loadMaterials(currentPrefix)
  }
}
