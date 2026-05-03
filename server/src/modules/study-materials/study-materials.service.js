import { supabaseServer } from '../../utils/supabase-server.js'

const BUCKET_NAME = 'study-materials'

/**
 * List materials (files and folders) under a path prefix
 * Returns folders and files separately
 */
export async function listMaterials(prefix = '') {
  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error('Supabase list error:', error)
      return { folders: [], files: [], error }
    }

    // Separate folders and files
    const folders = []
    const files = []

    for (const item of data) {
      // Skip placeholder files
      if (item.name === '.keep') continue

      // In Supabase, folders in the list() response don't have an id or have null metadata
      const isFolder = !item.id || (item.metadata === null) || (item.metadata?.size === 0 && !item.metadata?.mimetype)

      if (isFolder) {
        folders.push({
          name: item.name,
          id: item.id || `folder-${item.name}`,
          isFolder: true,
          created_at: item.created_at,
          updated_at: item.updated_at,
          prefix: prefix ? `${prefix}${item.name}/` : `${item.name}/`
        })
      } else {
        // It's a file
        files.push({
          name: item.name,
          id: item.id,
          isFolder: false,
          created_at: item.created_at,
          updated_at: item.updated_at,
          size: item.metadata?.size || 0,
          metadata: item.metadata || {},
          path: prefix ? `${prefix}${item.name}` : item.name
        })
      }
    }

    return { folders, files, error: null }
  } catch (err) {
    console.error('Error listing materials:', err)
    return { folders: [], files: [], error: err }
  }
}

/**
 * Upload material to a path
 */
export async function uploadMaterial(prefix, file, fileName) {
  try {
    const filePath = prefix ? `${prefix}${fileName}` : fileName

    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error uploading material:', err)
    return { data: null, error: err }
  }
}

/**
 * Delete material (file or folder)
 * For folders, we need to list and delete all files inside
 */
export async function deleteMaterial(path) {
  try {
    // Check if it's a folder (ends with /)
    if (path.endsWith('/')) {
      const folderPath = path.replace(/\/$/, '')
      
      // List all items in the folder
      const { data: items, error: listError } = await supabaseServer.storage
        .from(BUCKET_NAME)
        .list(folderPath)

      if (listError) return { error: listError }

      // Delete each item
      for (const item of items) {
        const itemPath = `${path}${item.name}`
        const isSubFolder = !item.id || (item.metadata === null) || (item.metadata?.size === 0 && !item.metadata?.mimetype)

        if (isSubFolder) {
          // Recursive call for subfolder
          const { error: subDeleteError } = await deleteMaterial(`${itemPath}/`)
          if (subDeleteError) return { error: subDeleteError }
        } else {
          // Simple remove for files
          const { error: deleteError } = await supabaseServer.storage
            .from(BUCKET_NAME)
            .remove([itemPath])
          if (deleteError) return { error: deleteError }
        }
      }
    } else {
      // Delete single file
      const { error } = await supabaseServer.storage
        .from(BUCKET_NAME)
        .remove([path])

      if (error) return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Error deleting material:', err)
    return { error: err }
  }
}

/**
 * Rename material (file or folder)
 * Supabase doesn't have native rename, so we copy + delete
 */
export async function renameMaterial(oldPath, newPath) {
  try {
    // If it's a folder (ends with /)
    if (oldPath.endsWith('/')) {
      const folderPath = oldPath.replace(/\/$/, '')
      
      // List all items in the folder
      const { data: items, error: listError } = await supabaseServer.storage
        .from(BUCKET_NAME)
        .list(folderPath)

      if (listError) return { error: listError }

      for (const item of items) {
        const itemOldPath = `${oldPath}${item.name}`
        const itemNewPath = `${newPath}${item.name}`

        // Check if item is a folder
        const isSubFolder = !item.id || (item.metadata === null) || (item.metadata?.size === 0 && !item.metadata?.mimetype)

        if (isSubFolder) {
          // Recursive call for subfolder
          const { error: subRenameError } = await renameMaterial(`${itemOldPath}/`, `${itemNewPath}/`)
          if (subRenameError) return { error: subRenameError }
        } else {
          // Simple move for files
          const { error: moveError } = await supabaseServer.storage
            .from(BUCKET_NAME)
            .move(itemOldPath, itemNewPath)
          if (moveError) return { error: moveError }
        }
      }
    } else {
      // Simple file rename using move
      const { error } = await supabaseServer.storage
        .from(BUCKET_NAME)
        .move(oldPath, newPath)

      if (error) return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Error renaming material:', err)
    return { error: err }
  }
}

/**
 * Get signed URL for private file download
 */
export async function getSignedUrl(path, expiresIn = 60) {
  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { signedUrl: null, error }
    }

    return { signedUrl: data.signedUrl, error: null }
  } catch (err) {
    console.error('Error getting signed URL:', err)
    return { signedUrl: null, error: err }
  }
}
