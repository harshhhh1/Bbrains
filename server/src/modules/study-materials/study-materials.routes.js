import express from 'express'
import multer from 'multer'
import verifyToken from '../../middleware/auth.middleware.js'
import authorize from '../../middleware/authorize.js'
import {
  listMaterialsController,
  uploadMaterialController,
  deleteMaterialController,
  renameMaterialController,
  getSignedUrlController
} from './study-materials.controller.js'

const router = express.Router()

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
})

// All routes require authentication
router.use(verifyToken)

// List materials (accessible by all authenticated users with permission checks in controller)
router.get('/list', listMaterialsController)

// Get signed URL for private file download (accessible by all authenticated users)
router.get('/signed-url', getSignedUrlController)

// Upload material (admin, manager, teacher only)
router.post(
  '/upload',
  authorize('admin', 'manager', 'superadmin', 'teacher'),
  upload.single('file'),
  uploadMaterialController
)

// Delete material (admin, manager, teacher only)
router.delete(
  '/delete',
  authorize('admin', 'manager', 'superadmin', 'teacher'),
  deleteMaterialController
)

// Rename material (admin, manager, teacher only)
router.put(
  '/rename',
  authorize('admin', 'manager', 'superadmin', 'teacher'),
  renameMaterialController
)

export default router
