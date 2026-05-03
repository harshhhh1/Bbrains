import type { StudyMaterialsResponse, StudyMaterialFile } from '../types/study-materials.types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * List materials (files and folders) under a path
 */
export async function listMaterials(
  prefix = '',
  collegeId?: string,
  courseId?: string
): Promise<StudyMaterialsResponse> {
  const params = new URLSearchParams()
  if (prefix) params.set('prefix', prefix)
  if (collegeId) params.set('collegeId', collegeId)
  if (courseId) params.set('courseId', courseId)

  const url = `${API_BASE}/api/study-materials/list?${params.toString()}`
  console.log('[listMaterials] URL:', url)
  
  const res = await fetch(url, {
    credentials: 'include'
  })

  if (!res.ok) {
    const err = await res.text()
    console.log('[listMaterials] Error:', err)
    throw new Error('Failed to list materials')
  }
  const json = await res.json()
  console.log('[listMaterials] Result:', JSON.stringify(json).substring(0, 200))
  return json
}

/**
 * Upload a file to a path
 */
export async function uploadMaterial(
  prefix: string,
  file: File,
  fileName?: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('prefix', prefix)
  if (fileName) formData.append('fileName', fileName)

  const res = await fetch(`${API_BASE}/api/study-materials/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}

/**
 * Delete a file or folder
 */
export async function deleteMaterial(path: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/study-materials/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ path })
  })

  if (!res.ok) throw new Error('Failed to delete material')
  return res.json()
}

/**
 * Rename a file or folder
 */
export async function renameMaterial(
  oldPath: string,
  newPath: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/study-materials/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ oldPath, newPath })
  })

  if (!res.ok) throw new Error('Failed to rename material')
  return res.json()
}

/**
 * Get signed URL for private file download
 */
export async function getSignedUrl(
  path: string,
  expiresIn = 60
): Promise<{ success: boolean; signedUrl?: string }> {
  const params = new URLSearchParams()
  params.set('path', path)
  params.set('expiresIn', expiresIn.toString())

  const res = await fetch(`${API_BASE}/api/study-materials/signed-url?${params.toString()}`, {
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to get signed URL')
  return res.json()
}
