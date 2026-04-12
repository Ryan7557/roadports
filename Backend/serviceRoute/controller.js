const path = require('path');
const Pothole = require('../common/models/Potholes');
const { potholeSchema } = require('../common/middlewares/validation');

/**
 * POST /api/potholes  (multipart/form-data)
 * Pipeline: upload.single('image') → geocodeAddress → reportPothole
 */
const reportPothole = async (req, res) => {
    // 1. Ensure an image was uploaded
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'A pothole image is required. Send it as form-data with the key "image".',
        });
    }

    // 2. Validate text fields with Zod
    const result = potholeSchema.safeParse(req.body);
    if (!result.success) {
        console.error('[reportPothole] Validation Error:', result.error.flatten().fieldErrors);
        return res.status(400).json({
            success: false,
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { 
        street, surburb, city, province, country, coordinates, 
        email, name, phone, 
        isPothole, confidenceScore, severity,
        userId
    } = req.body;

    // Build a relative URL path that can be served statically, e.g. /uploads/pothole-123.jpg
    const imageUrl = `/uploads/${path.basename(req.file.path)}`;

    try {
        // 3. Build and save the pothole document
        const pothole = new Pothole({
            userId,
            imageUrl,
            location: {
                type: 'Point',
                coordinates, // [lng, lat] — attached by geocodeAddress middleware
            },
            address: { street, surburb, city, province, country },
            reportedBy: { email, name, phone },
            verification: {
                isPothole: isPothole || false,
                confidenceScore: confidenceScore || 0,
                severity: severity || 'low',
                verifiedBy: 'ai',
                verifiedAt: new Date()
            }
        });

        const saved = await pothole.save();

        return res.status(201).json({
            success: true,
            message: 'Pothole reported successfully',
            data: saved,
        });
    } catch (err) {
        console.error('[reportPothole] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to save pothole report. Please try again.',
        });
    }
};

const getAllPotholes = async (req, res) => {
    try {
        const potholes = await Pothole.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: potholes
        });
    } catch (err) {
        console.error('[getAllPotholes] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch potholes. Please try again.',
        });
    }
};

const deletePothole = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Pothole.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Pothole report not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Pothole report deleted successfully'
        });
    } catch (err) {
        console.error('[deletePothole] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete pothole. Please try again.',
        });
    }
};

const updatePotholeStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // We will allow the frontend to easily test, but we still ensure status is valid
    const validStatuses = ['reported', 'verified', 'assigned', 'in_progress', 'repaired', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status provided.'
        });
    }

    try {
        const updated = await Pothole.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Pothole report not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: updated
        });
    } catch (err) {
        console.error('[updatePotholeStatus] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update pothole status. Please try again.',
        });
    }
};

module.exports = { reportPothole, getAllPotholes, deletePothole, updatePotholeStatus };
