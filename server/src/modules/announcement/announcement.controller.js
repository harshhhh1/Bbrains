import prisma from '../../utils/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { z } from 'zod';
import { deleteFromCloudinary } from '../../utils/cloudinary.js';

const createAnnouncementSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    isGlobal: z.boolean().optional().default(false),
    collegeId: z.number().optional(),
    category: z.string().optional()
});

const defaultIncludes = {
    user: {
        select: {
            id: true,
            username: true,
            type: true,
            userDetails: {
                select: { avatar: true, firstName: true, lastName: true }
            }
        }
    },
    acknowledged: {
        include: {
            user: {
                select: {
                    id: true,
                    userDetails: {
                        select: { firstName: true, lastName: true }
                    }
                }
            }
        }
    }
};

const formatAckUsers = (acknowledged) => acknowledged?.map(ack => ({
    userId: ack.userId,
    userDetails: ack.user?.userDetails ? {
        firstName: ack.user.userDetails.firstName,
        lastName: ack.user.userDetails.lastName
    } : undefined,
    createdAt: ack.createdAt.toISOString()
})) || [];

export const createAnnouncement = async (req, res, next) => {
    try {
        const { title, description, image, isGlobal, collegeId: bodyCollegeId } = createAnnouncementSchema.parse(req.body ?? {});
        const userId = req.user?.id;
        const collegeId = isGlobal ? null : (bodyCollegeId || req.user?.collegeId);

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized missing user id" });
        
        const announcement = await prisma.announcement.create({
            data: { userId, collegeId, isGlobal, title, description, image },
            include: { user: defaultIncludes.user, acknowledged: false }
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) { next(err); }
};

export const getAllAnnouncements = async (req, res, next) => {
    try {
        const collegeId = req.user?.collegeId;
        const announcements = await prisma.announcement.findMany({
            where: { OR: [{ collegeId }, { isGlobal: true }] },
            include: defaultIncludes,
            orderBy: { createdAt: 'desc' }
        });
        
        const formatted = announcements.map(ann => ({
            ...ann,
            acknowledgedBy: formatAckUsers(ann.acknowledged)
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) { next(error); }
};

export const deleteAnnouncement = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const announcement = await prisma.announcement.findUnique({ where: { id } });

        if (!announcement) throw new NotFoundError('Announcement not found');

        if (announcement.image) {
            deleteFromCloudinary(announcement.image).catch(err => 
                console.error('Failed to cleanup announcement image from Cloudinary:', err)
            );
        }

        await prisma.announcement.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (error) { next(error); }
};

export const acknowledgeAnnouncement = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user?.id;

        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid announcement ID" });
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const [announcement, existingAck] = await Promise.all([
            prisma.announcement.findUnique({ where: { id } }),
            prisma.acknowledged.findFirst({ where: { announcementId: id, userId } })
        ]);

        if (!announcement) throw new NotFoundError('Announcement not found');
        if (existingAck) return res.status(200).json({ success: true, message: "Already acknowledged" });

        await prisma.acknowledged.create({ data: { announcementId: id, userId } });

        const updated = await prisma.announcement.findUnique({
            where: { id },
            include: defaultIncludes
        });

        res.status(200).json({
            success: true, 
            data: { ...updated, acknowledgedBy: formatAckUsers(updated.acknowledged) }
        });
    } catch (error) { next(error); }
};

export const getAcknowledgedUsers = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const acks = await prisma.acknowledged.findMany({
            where: { announcementId: id },
            include: defaultIncludes.acknowledged.include,
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: formatAckUsers(acks) });
    } catch (error) { next(error); }
};
