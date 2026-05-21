import {
  getAllProducts as getProductsList, getProductWithDetails, createProduct as createProductSvc, updateProduct as updateProductSvc,
  deleteProduct as deleteProductSvc, findProductByName, getCreatorSales
} from "../market.service.js";
import { sendSuccess, sendCreated, sendPaginated, sendError } from "../../../utils/response.js";
import { createAuditLog } from "../../../utils/auditLog.js";
import prisma from "../../../utils/prisma.js";
import { deleteFromCloudinary } from '../../../utils/cloudinary.js';
import { createNotification } from "../../notification/notification.service.js";
import { approvalSchema, productSchema, createProductSchema } from "../schemas.js";

// GET /market/products
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await getProductsList((page - 1) * limit, limit, req.user.collegeId);
    return sendPaginated(res, result.products, { page, limit, total: result.total });
  } catch (error) {
    console.error('[getAllProducts] Error:', error);
    return sendError(res, error.message || 'Failed to fetch products', 500);
  }
};

// GET /market/products/:id
export const getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);
    const product = await getProductWithDetails(id);
    if (!product) return sendError(res, 'Product not found', 404);
    
    if (product.creator?.collegeId !== req.user.collegeId) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.approval !== 'approved') {
      const isCreator = product.creatorId === req.user?.id;
      const isAdmin = req.user?.type === 'admin' || req.user?.type === 'teacher';
      if (!isCreator && !isAdmin) {
        return sendError(res, 'Product not found', 404);
      }
    }
    
    delete product.creator.collegeId;
    return sendSuccess(res, product);
  } catch (error) {
    return sendError(res, 'Failed to fetch product', 500);
  }
};

// POST /market/products
export const createProduct = async (req, res) => {
  try {
    const body = req.body;
    if (!body) return sendError(res, 'No data provided', 400);

    const validated = createProductSchema.parse(body);
    
    if (!req.user) {
      console.error('[createProduct] req.user is missing!');
      return sendError(res, 'User context missing', 401);
    }

    const isPrivileged = req.user.type === "teacher" || req.user.type === "admin";
    const approval = isPrivileged ? "approved" : "pending";
    
    const metadata = typeof validated.metadata === 'object' ? validated.metadata : {};
    if (validated.category) {
      metadata.category = validated.category;
    }

    const productData = {
      name: validated.name,
      description: validated.description || '',
      price: Number(validated.price),
      stock: validated.productType === 'physical' ? Number(validated.stock || 0) : 999999,
      image: validated.imageUrl || null,
      creatorId: req.user.id,
      approval,
      metadata,
      productType: validated.productType
    };

    if (validated.productType === 'digital' && validated.fileUrl) {
      metadata.fileUrl = validated.fileUrl;
      metadata.fileType = validated.fileType || 'file';
    }

    const product = await createProductSvc(
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.image,
      productData.creatorId,
      productData.approval,
      productData.metadata,
      productData.productType
    );

    await createAuditLog(req.user.id, 'MARKET', 'CREATE', 'Product', product.id);
    return sendCreated(res, product, 'Product created');
  } catch (error) {
    console.error('[createProduct] CATCH BLOCK:', error);
    if (error && (error.name === 'ZodError' || error.constructor?.name === 'ZodError')) {
      return sendError(res, 'Validation failed', 400, error.errors || []);
    }
    return sendError(res, error?.message || 'Failed to create product', 500);
  }
};

// PUT /market/products/:id
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    const isCreator = product.creatorId === req.user.id;
    const isPrivileged = req.user.type === 'teacher' || req.user.type === 'admin';

    if (!isPrivileged && !isCreator) {
      return sendError(res, 'Unauthorized to update this product', 403);
    }

    if (!isPrivileged && product.approval !== 'pending') {
      return sendError(res, 'Cannot edit approved product directly. Request an edit review instead.', 403);
    }

    const validated = productSchema.partial().parse(req.body);
    const updateData = { ...validated };
    
    if (updateData.imageUrl) {
      updateData.image = updateData.imageUrl;
      delete updateData.imageUrl;

      if (product.image && product.image !== updateData.image) {
        deleteFromCloudinary(product.image).catch(err => 
          console.error('Failed to cleanup old product image from Cloudinary:', err)
        );
      }
    }

    if (updateData.fileUrl && product.metadata?.fileUrl && product.metadata.fileUrl !== updateData.fileUrl) {
      deleteFromCloudinary(product.metadata.fileUrl).catch(err => 
        console.error('Failed to cleanup old product file from Cloudinary:', err)
      );
    }

    const updated = await updateProductSvc(id, updateData);
    await createAuditLog(req.user.id, 'MARKET', 'UPDATE', 'Product', id, { after: validated });
    return sendSuccess(res, updated, 'Product updated');
  } catch (error) {
    console.error('[updateProduct] Error:', error);
    if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors);
    if (error.code === 'P2025') return sendError(res, 'Product not found', 404);
    return sendError(res, 'Failed to update product', 500);
  }
};

// DELETE /market/products/:id (Only product creators can delete)
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    const isCreator = product.creatorId === req.user.id;

    if (!isCreator) {
      return sendError(res, 'Unauthorized to delete this product', 403);
    }

    if (product.image) {
      deleteFromCloudinary(product.image).catch(err => 
        console.error('Failed to cleanup product image from Cloudinary:', err)
      );
    }

    if (product.metadata?.fileUrl) {
      deleteFromCloudinary(product.metadata.fileUrl).catch(err => 
        console.error('Failed to cleanup product file from Cloudinary:', err)
      );
    }

    await deleteProductSvc(id);
    await createAuditLog(req.user.id, 'MARKET', 'DELETE', 'Product', id);
    return sendSuccess(res, null, 'Product deleted');
  } catch (error) {
    if (error.code === 'P2025') return sendError(res, 'Product not found', 404);
    return sendError(res, 'Failed to delete product', 500);
  }
};

// GET /market/products/search?query=...
export const searchProductsHandler = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return sendError(res, 'Search query required', 400);
    const products = await findProductByName(query, req.user.collegeId);
    return sendSuccess(res, products);
  } catch (error) {
    return sendError(res, 'Failed to search products', 500);
  }
};

// GET /market/my-products
export const getMyProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { creatorId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: { select: { rating: true } },
        orderItems: {
          select: { quantity: true },
          where: {
            order: {
              OR: [
                { status: 'completed' },
                { status: 'delivered' }
              ]
            }
          }
        }
      }
    });

    const productsWithStats = products.map(p => {
      const reviewCount = p.reviews.length;
      const avgRating = reviewCount > 0
        ? parseFloat((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;
      const unitsSold = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);

      return {
        ...p,
        rating: avgRating,
        reviewCount,
        unitsSold,
        reviews: undefined,
        orderItems: undefined
      };
    });

    return sendSuccess(res, productsWithStats);
  } catch (error) {
    return sendError(res, 'Failed to fetch your products', 500);
  }
};

// GET /market/pending
export const getPendingProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { 
        creator: { collegeId: req.user.collegeId },
        OR: [
          { approval: 'pending' },
          {
            metadata: {
              path: ['editStatus'],
              equals: 'pending'
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, username: true } } }
    });

    const mappedProducts = products.map(product => {
      const metadata = product.metadata || {};
      if (metadata.editStatus === 'pending' && metadata.pendingEdit) {
        const pending = metadata.pendingEdit;
        return {
          ...product,
          name: pending.name !== undefined ? pending.name : product.name,
          description: pending.description !== undefined ? pending.description : product.description,
          price: pending.price !== undefined ? pending.price : product.price,
          stock: pending.stock !== undefined ? pending.stock : product.stock,
          image: pending.imageUrl !== undefined ? pending.imageUrl : (pending.image !== undefined ? pending.image : product.image),
          productType: pending.productType !== undefined ? pending.productType : product.productType
        };
      }
      return product;
    });

    return sendSuccess(res, mappedProducts);
  } catch (error) {
    console.error('[getPendingProducts] Error:', error);
    return sendError(res, error.message || 'Failed to fetch pending products', 500);
  }
};

// PATCH /market/products/:id/approval
export const approveProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const validated = approvalSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    const metadata = product.metadata || {};
    let dataToUpdate = {};
    const isEditApproval = metadata.editStatus === 'pending' && metadata.pendingEdit;

    if (isEditApproval) {
      const pending = metadata.pendingEdit;
      
      if (validated.status === 'approved') {
        const updateData = { ...pending };
        if (updateData.imageUrl) {
          updateData.image = updateData.imageUrl;
          delete updateData.imageUrl;
        }

        if (product.image && updateData.image && product.image !== updateData.image) {
          deleteFromCloudinary(product.image).catch(err => 
            console.error('Failed to cleanup old product image from Cloudinary:', err)
          );
        }

        if (updateData.fileUrl && product.metadata?.fileUrl && product.metadata.fileUrl !== updateData.fileUrl) {
          deleteFromCloudinary(product.metadata.fileUrl).catch(err => 
            console.error('Failed to cleanup old product file from Cloudinary:', err)
          );
        }

        const newMetadata = typeof updateData.metadata === 'object' && updateData.metadata !== null
          ? { ...metadata, ...updateData.metadata }
          : { ...metadata };
        
        if (updateData.category) {
          newMetadata.category = updateData.category;
        }

        delete newMetadata.pendingEdit;
        delete newMetadata.editStatus;
        delete newMetadata.rejectionReason;

        const rootFields = ['name', 'description', 'price', 'stock', 'productType', 'image'];
        rootFields.forEach(field => {
          if (field in updateData) {
            dataToUpdate[field] = field === 'price' || field === 'stock' ? Number(updateData[field]) : updateData[field];
          }
        });

        dataToUpdate.metadata = newMetadata;
      } else {
        const newMetadata = { ...metadata };
        delete newMetadata.pendingEdit;
        newMetadata.editStatus = 'rejected';
        newMetadata.rejectionReason = validated.reason || 'No detail provided.';
        dataToUpdate.metadata = newMetadata;
      }
    } else {
      if (validated.status === 'rejected' && validated.reason) {
        metadata.rejectionReason = validated.reason;
      } else if (validated.status === 'approved') {
        delete metadata.rejectionReason;
      }

      dataToUpdate.approval = validated.status;
      dataToUpdate.metadata = metadata;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    await createAuditLog(
      req.user.id, 'MARKET',
      isEditApproval
        ? (validated.status === 'approved' ? 'APPROVE_EDIT' : 'REJECT_EDIT')
        : (validated.status === 'approved' ? 'APPROVE_PRODUCT' : 'REJECT_PRODUCT'),
      'Product', id,
      isEditApproval ? { changes: metadata.pendingEdit } : null,
      validated.reason || null
    );

    await createNotification(
      product.creatorId,
      isEditApproval
        ? (validated.status === 'approved' ? 'Product Edit Approved! 🎉' : 'Product Edit Rejected')
        : (validated.status === 'approved' ? 'Product Approved! 🎉' : 'Product Action Required'),
      isEditApproval
        ? (validated.status === 'approved'
            ? `Your edit request for product "${product.name}" has been approved.`
            : `Your edit request for product "${product.name}" was not approved. Reason: ${validated.reason || 'No detail provided.'}`)
        : (validated.status === 'approved'
            ? `Great news! Your product "${product.name}" has been approved and is now live.`
            : `Your product "${product.name}" was not approved. Reason: ${validated.reason || 'No detail provided.'}`),
      'market',
      String(product.id)
    );

    return sendSuccess(res, updated, isEditApproval ? `Product edit ${validated.status}` : `Product ${validated.status}`);
  } catch (error) {
    if (error.name === 'ZodError') return sendError(res, 'Invalid validation.', 400);
    return sendError(res, 'Failed to update product approval', 500);
  }
};

// POST /market/products/:id/request-edit
export const requestProductEdit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid product ID', 400);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(res, 'Product not found', 404);

    if (product.creatorId !== req.user.id) {
      return sendError(res, 'Only the creator can request an edit review', 403);
    }

    const validated = productSchema.partial().parse(req.body);
    const metadata = product.metadata ? JSON.parse(JSON.stringify(product.metadata)) : {};
    
    metadata.pendingEdit = {
      ...validated,
      requestedAt: new Date().toISOString()
    };
    metadata.editStatus = 'pending';

    const updated = await prisma.product.update({
      where: { id },
      data: { metadata }
    });

    await createAuditLog(req.user.id, 'MARKET', 'REQUEST_EDIT', 'Product', id, { changes: validated });
    return sendSuccess(res, updated, 'Edit review requested');
  } catch (error) {
    console.error('[requestProductEdit] FAILED:', error);
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors);
    }
    return sendError(res, error.message || 'Failed to request edit review', 500);
  }
};

// GET /market/sales
export const getSales = async (req, res) => {
  try {
    const sales = await getCreatorSales(req.user.id);
    return sendSuccess(res, sales);
  } catch (error) {
    return sendError(res, 'Failed to fetch sales data', 500);
  }
};
