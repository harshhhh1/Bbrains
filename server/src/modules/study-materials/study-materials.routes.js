import express from 'express'
import multer from 'multer'
import verifyToken from '../../middleware/auth.middleware.js'
import checkPermission from '../../middleware/checkPermission.js'
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

// Upload material (users with upload_materials permission)
router.post(
  '/upload',
  checkPermission('upload_materials'),
  upload.single('file'),
  uploadMaterialController
)

// Delete material (users with upload_materials permission)
router.delete(
  '/delete',
  checkPermission('upload_materials'),
  deleteMaterialController
)

// Rename material (users with upload_materials permission)
router.put(
  '/rename',
  checkPermission('upload_materials'),
  renameMaterialController
)

export default router
