import { getCollegeById, updateCollegeRecord } from '../college/college.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

// GET /sidebaraccess
export const getSidebarAccess = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        if (!collegeId) return sendError(res, 'College ID not found in session', 400);

        const college = await getCollegeById(collegeId);
        if (!college) return sendError(res, 'College not found', 404);

        const sidebarAccess = college.features?.sidebarAccess || null;
        return sendSuccess(res, sidebarAccess);
    } catch (error) {
        console.error('[SidebarAccess] Fetch error:', error);
        return sendError(res, 'Failed to fetch sidebar access', 500);
    }
};

// POST /sidebaraccess
export const updateSidebarAccess = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        const newMap = req.body;

        const college = await getCollegeById(collegeId);
        if (!college) return sendError(res, 'College not found', 404);

        const updatedFeatures = {
            ...(typeof college.features === 'object' ? college.features : {}),
            sidebarAccess: newMap
        };

        await updateCollegeRecord(collegeId, { features: updatedFeatures });

        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'College', collegeId, { 
            action: 'update_sidebar_access',
            after: newMap 
        });

        return sendSuccess(res, newMap, 'Sidebar access updated successfully');
    } catch (error) {
        console.error('[SidebarAccess] Update error:', error);
        return sendError(res, 'Failed to update sidebar access', 500);
    }
};
