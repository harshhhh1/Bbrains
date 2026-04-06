import prisma from '../utils/prisma.js';

/**
 * Permission-based authorization middleware.
 * Usage: checkPermission('create_announcement')
 * Checks if the authenticated user has the specified permission key enabled in any of their roles.
 * Must be used AFTER verifyToken middleware.
 */
const checkPermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }

            const userId = req.user.id;
            const type = req.user.type;

            // Superadmins bypass all permission checks
            if (type === 'superadmin' || type === 'admin') {
                return next();
            }

            // Fetch user's roles and permissions for their active college
            const userRoles = await prisma.userRoles.findMany({
                where: { userId },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            // Extract all enabled permission keys
            const activePermissions = new Set();
            userRoles.forEach((ur) => {
                const role = ur.role;
                if (role?.permissions) {
                    role.permissions.forEach((rp) => {
                        if (rp.enabled && rp.permission?.key) {
                            activePermissions.add(rp.permission.key);
                        }
                    });
                }
            });

            // Check if user has the specific permission OR global administrator permission
            if (activePermissions.has(permissionKey) || activePermissions.has('administrator')) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: `You do not have permission to ${permissionKey.replace(/_/g, ' ')}`
            });
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({ success: false, message: 'Authorization error' });
        }
    };
};

export default checkPermission;
