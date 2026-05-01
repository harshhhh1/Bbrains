import prisma from './prisma.js';

/**
 * Resolves the college ID to use for a request, enforcing security rules.
 * Superadmins can request any collegeId. Others are restricted to their own.
 */
export const resolveCollegeId = async (requestedCollegeId, fallbackCollegeId, userType = null, originalType = null) => {
    // If not superadmin/official, and they requested a different college, block it
    if (
        userType !== 'superadmin' &&
        userType !== 'bbrains_official' &&
        originalType !== 'superadmin' &&
        originalType !== 'bbrains_official' &&
        requestedCollegeId !== undefined &&
        requestedCollegeId !== null &&
        fallbackCollegeId &&
        Number(requestedCollegeId) !== Number(fallbackCollegeId)
    ) {
        throw new Error('You can only manage users within your own college');
    }

    // Default to the requested college or the user's home college
    const collegeId = requestedCollegeId ?? fallbackCollegeId;

    if (!collegeId) {
        if (userType === 'superadmin' || originalType === 'superadmin') {
            return null; // Return null to indicate "all colleges" for superadmins
        }
        throw new Error('No college is associated with the request');
    }

    // Verify college exists
    const college = await prisma.college.findUnique({
        where: { id: Number(collegeId) },
        select: { id: true }
    });

    if (!college) {
        throw new Error('The specified college does not exist');
    }

    return college.id;
};
