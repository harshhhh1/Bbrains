export interface StudyMaterialFolder {
  name: string          // ID (used for path)
  id: string
  isFolder: true
  displayName?: string  // Display name (college/course name)
  created_at: string
  updated_at: string
  prefix: string        // Full path prefix for this folder
}

export interface StudyMaterialFile {
  name: string
  id: string
  isFolder: false
  created_at: string
  updated_at: string
  size: number
  metadata: {
    size: number
    mimetype: string
    [key: string]: any
  }
  path: string // Full path to the file
  publicUrl?: string
  signedUrl?: string
}

export interface StudyMaterialsResponse {
  success: boolean
  data: {
    folders: StudyMaterialFolder[]
    files: StudyMaterialFile[]
    prefix: string
    breadcrumbNames?: { name: string; displayName: string }[]
  }
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'manager' | 'superadmin'

export interface StudyMaterialsState {
  folders: StudyMaterialFolder[]
  files: StudyMaterialFile[]
  currentPrefix: string
  breadcrumbs: { name: string; prefix: string }[]
  isLoading: boolean
  error: string | null
  canEdit: boolean // Based on user role
}
