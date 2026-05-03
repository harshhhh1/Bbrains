import { listMaterials, uploadMaterial, deleteMaterial, renameMaterial, getSignedUrl } from './study-materials.service.js'
import prisma from '../../utils/prisma.js'

/**
 * List materials (files and folders) under a path
 * Query params: prefix (default ''), collegeId, courseId
 */
export async function listMaterialsController(req, res, next) {
  try {
    const { prefix, collegeId: queryCollegeId, courseId: queryCourseId } = req.query
    const user = req.user // Set by auth middleware

    // Build prefix from collegeId/courseId if provided
    let pathPrefix = prefix || ''
    let collegeId = queryCollegeId ? String(queryCollegeId) : undefined
    let courseId = queryCourseId ? String(queryCourseId) : undefined

    // If prefix is provided, extract collegeId and courseId from it
    if (pathPrefix && !collegeId) {
      const parts = pathPrefix.split('/').filter(Boolean)
      if (parts.length >= 1) collegeId = parts[0]
      if (parts.length >= 2) courseId = parts[1]
    }

    if (!pathPrefix && collegeId) {
      pathPrefix = `${collegeId}/`
      if (courseId) pathPrefix += `${courseId}/`
    }

    console.log(`[listMaterialsController] user.type=${user.type}, user.collegeId=${user.collegeId}, collegeId=${collegeId}, courseId=${courseId}, prefix=${pathPrefix}`)

    // Check permissions
    if (user.type === 'student') {
      // Students can only access their enrolled courses
      if (!courseId) {
        return res.status(403).json({ success: false, message: 'Students must specify a courseId' })
      }
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: Number(courseId) }
      })
      if (!enrollment) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' })
      }
    } else if (['teacher', 'admin', 'manager', 'superadmin'].includes(user.type)) {
      // Check college access (compare as strings)
      if (collegeId && String(user.collegeId) !== collegeId && user.type !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Access denied to this college' })
      }
    }

    const { folders, files, error } = await listMaterials(pathPrefix)
    if (error) return next(error)

    // Fetch names for folders
    const foldersWithNames = await Promise.all(
      folders.map(async (folder) => {
        const parts = folder.prefix.split('/').filter(Boolean)
        const folderCollegeId = parts[0]
        const folderCourseId = parts[1]

        let displayName = folder.name

        if (parts.length === 2 && !isNaN(Number(folderCourseId))) {
          // It's a course folder - fetch course name
          const course = await prisma.course.findUnique({
            where: { id: Number(folderCourseId) },
            select: { name: true }
          })
          if (course) displayName = course.name
        } else if (parts.length === 1 && !isNaN(Number(folderCollegeId))) {
          // It's a college folder - fetch college name
          const college = await prisma.college.findUnique({
            where: { id: Number(folderCollegeId) },
            select: { name: true }
          })
          if (college) displayName = college.name
        }

        return { ...folder, displayName }
      })
    )

    // Fetch names for breadcrumbs
    const prefixParts = pathPrefix.split('/').filter(Boolean)
    const breadcrumbData = await Promise.all(
      prefixParts.map(async (part, index) => {
        const isCollege = index === 0
        const isCourse = index === 1
        let displayName = part

        if (isCollege && !isNaN(Number(part))) {
          const college = await prisma.college.findUnique({
            where: { id: Number(part) },
            select: { name: true }
          })
          if (college) displayName = college.name
        } else if (isCourse && !isNaN(Number(part))) {
          const course = await prisma.course.findUnique({
            where: { id: Number(part) },
            select: { name: true }
          })
          if (course) displayName = course.name
        }

        return { name: part, displayName }
      })
    )

    res.json({ 
      success: true, 
      data: { 
        folders: foldersWithNames, 
        files, 
        prefix: pathPrefix,
        breadcrumbNames: breadcrumbData 
      } 
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Upload material to a path
 * Body: formData with file, prefix (path), fileName
 */
export async function uploadMaterialController(req, res, next) {
  try {
    const { prefix, fileName } = req.body
    const file = req.file // From multer middleware

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' })
    }

    const { data, error } = await uploadMaterial(prefix || '', file, fileName || file.originalname)
    if (error) return next(error)

    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete material (file or folder)
 * Body: path (full path to delete)
 */
export async function deleteMaterialController(req, res, next) {
  try {
    const { path } = req.body

    if (!path) {
      return res.status(400).json({ success: false, message: 'Path is required' })
    }

    const { error } = await deleteMaterial(path)
    if (error) return next(error)

    res.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Rename material (file or folder)
 * Body: oldPath, newPath
 */
export async function renameMaterialController(req, res, next) {
  try {
    const { oldPath, newPath } = req.body

    if (!oldPath || !newPath) {
      return res.status(400).json({ success: false, message: 'oldPath and newPath are required' })
    }

    const { error } = await renameMaterial(oldPath, newPath)
    if (error) return next(error)

    res.json({ success: true, message: 'Renamed successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get signed URL for private file download
 * Query params: path, expiresIn (default 60)
 */
export async function getSignedUrlController(req, res, next) {
  try {
    const { path, expiresIn = 60 } = req.query

    if (!path) {
      return res.status(400).json({ success: false, message: 'Path is required' })
    }

    const { signedUrl, error } = await getSignedUrl(path, Number(expiresIn))
    if (error) return next(error)

    res.json({ success: true, signedUrl })
  } catch (error) {
    next(error)
  }
}
