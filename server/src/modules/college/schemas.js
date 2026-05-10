import { z } from 'zod';

const addressSchema = z.object({
    addressLine1: z.string().min(1).max(255),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().min(1).max(50),
    state: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(10).optional().nullable(),
    country: z.string().min(1).max(100)
});

const createCollegeSchema = z.object({
    name: z.string().min(1).max(50),
    email: z.string().email().max(50),
    regNo: z.string().min(1).max(50),
    address: addressSchema.optional()
});

const updateCollegeSchema = createCollegeSchema.partial();

export {
    addressSchema,
    createCollegeSchema,
    updateCollegeSchema
};