import { sendSuccess, sendPaginated, sendError } from "../../../utils/response.js";
import prisma from "../../../utils/prisma.js";

// GET /market/themes - Get all approved themes
export const getAllThemes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [themes, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          approval: 'approved',
          creator: { collegeId: req.user.collegeId },
          metadata: {
            contains: { category: 'theme' }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { username: true, email: true }
          }
        }
      }),
      prisma.product.count({
        where: {
          approval: 'approved',
          creator: { collegeId: req.user.collegeId },
          metadata: {
            contains: { category: 'theme' }
          }
        }
      })
    ]);

    return sendPaginated(res, themes, { page, limit, total });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return sendError(res, 'Failed to fetch themes', 500);
  }
};

// GET /market/themes/:id - Get a specific theme
export const getTheme = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid theme ID', 400);

    const theme = await prisma.product.findFirst({
      where: {
        id,
        approval: 'approved',
        creator: { collegeId: req.user.collegeId },
        metadata: {
          contains: { category: 'theme' }
        }
      },
      include: {
        creator: {
          select: { username: true, email: true }
        }
      }
    });

    if (!theme) return sendError(res, 'Theme not found', 404);
    return sendSuccess(res, theme);
  } catch (error) {
    return sendError(res, 'Failed to fetch theme', 500);
  }
};

// GET /market/library - Get user's purchased items (themes, notes, etc.)
export const getLibrary = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const libraryItems = await prisma.library.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            creator: { select: { username: true } }
          }
        }
      },
      orderBy: { purchasedAt: 'desc' },
    });

    let allItems = libraryItems.map(item => {
      const p = item.product;
      const metadata = p.metadata || {};
      return {
        id: item.id,
        productId: item.productId,
        name: p.name,
        description: p.description,
        image: p.image,
        category: metadata.category || 'product',
        fileUrl: metadata.fileUrl,
        fileType: metadata.fileType,
        themeConfig: metadata.themeConfig,
        version: metadata.version,
        purchasedAt: item.purchasedAt,
        creator: p.creator?.username || 'Unknown'
      };
    });

    if (category && category !== 'all' && category !== 'undefined') {
      allItems = allItems.filter(item => item.category === category);
    }

    const total = allItems.length;
    const paginatedItems = allItems.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: paginatedItems,
      pagination: { page, limit, total }
    });
  } catch (error) {
    console.error('Error in getLibrary:', error);
    return sendError(res, 'Failed to fetch library', 500);
  }
};

// GET /market/library/:productId/download - Get download URL for purchased item
export const getDownloadUrl = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const purchase = await prisma.library.findFirst({
      where: {
        productId,
        userId: req.user.id
      }
    });

    if (!purchase) return sendError(res, 'Item not purchased', 403);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { metadata: true }
    });

    const fileUrl = product?.metadata?.fileUrl;
    if (!fileUrl) return sendError(res, 'Download not available', 404);

    return sendSuccess(res, { url: fileUrl });
  } catch (error) {
    return sendError(res, 'Failed to get download URL', 500);
  }
};

// POST /market/library/:productId/apply - Apply a purchased theme
export const applyTheme = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const purchase = await prisma.library.findFirst({
      where: {
        productId,
        userId: req.user.id
      },
      include: {
        product: {
          select: { metadata: true }
        }
      }
    });

    if (!purchase) return sendError(res, 'Theme not purchased', 403);

    const category = purchase.product.metadata?.category;
    if (category !== 'theme') return sendError(res, 'Not a theme product', 400);

    await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        theme: String(productId)
      },
      update: {
        theme: String(productId)
      }
    });

    return sendSuccess(res, { themeId: productId }, 'Theme applied');
  } catch (error) {
    console.error('Error applying theme:', error);
    return sendError(res, 'Failed to apply theme', 500);
  }
};

// GET /market/library/active-theme - Get user's current active theme
export const getActiveTheme = async (req, res) => {
  try {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: req.user.id },
      select: { theme: true }
    });

    if (!preference?.theme) {
      return sendSuccess(res, null);
    }

    const themeId = parseInt(preference.theme);
    if (isNaN(themeId)) {
      return sendSuccess(res, null);
    }

    const theme = await prisma.product.findUnique({
      where: { id: themeId },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        metadata: true
      }
    });

    return sendSuccess(res, theme);
  } catch (error) {
    return sendError(res, 'Failed to get active theme', 500);
  }
};
