import { z } from 'zod';

const setupPinSchema = z.object({
    pin: z.string().length(6).regex(/^\d+$/, 'PIN must be 6 digits')
});

const changePinSchema = z.object({
    oldPin: z.string().length(6),
    newPin: z.string().length(6).regex(/^\d+$/, 'PIN must be 6 digits')
});

const transferSchema = z.object({
    toUserId: z.string().min(1, "Recipient is required"),
    amount: z.number().positive(),
    note: z.string().max(255).optional(),
    pin: z.string().length(6)
});

export {
    setupPinSchema,
    changePinSchema,
    transferSchema
};