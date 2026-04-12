const { z } = require('zod');

const potholeSchema = z.object({
    // Address fields — coordinates are resolved server-side by the geocoding middleware
    // Address fields — made optional so users can drop pins without text formats
    street: z.string().max(100).optional().or(z.literal('')),
    surburb: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    province: z.string().max(100).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),

    // GPS coordinates passed from the frontend Map pin
    // GPS coordinates - can be string (raw) or array (after geocode middleware)
    coordinates: z.union([z.string(), z.array(z.number())]).optional(),

    // AI verification stats passed from the scan step
    isPothole: z.preprocess((val) => val === undefined ? undefined : val === 'true', z.boolean().optional()),
    confidenceScore: z.preprocess((val) => val === undefined ? undefined : parseFloat(val), z.number().optional()),
    severity: z.string().optional(),

    // Optional: citizen contact info
    email: z.string().email().optional().or(z.literal('')),
    name: z.string().max(100).optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),

    // Firebase Auth UID
    userId: z.string().min(1)
});

module.exports = { potholeSchema };

