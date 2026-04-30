const path = require('path');
const fs = require('fs');
const Pothole = require('../common/models/Potholes');
const { potholeSchema } = require('../common/validations/validation');
const AppError = require('../common/utils/AppError');
const asyncCatch = require('../common/middlewares/asyncCatch');
const agenda = require('../common/jobs/agenda');
const { uploadImage } = require('../common/services/supabase');

/**
 * POST /api/potholes  (multipart/form-data)
 * Pipeline: upload.single('image') → verifyUser → geocodeAddress → reportPothole
 */
const reportPothole = asyncCatch(async (req, res, next) => {
    // 1. Ensure an image was uploaded
    if (!req.file) {
        return next(new AppError('A pothole image is required. Send it as form-data with the key "image".', 400));
    }

    // 2. Validate text fields with Zod
    const result = potholeSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        console.error('[reportPothole] Validation Error:', errors);
        // Clean up temp file before returning error
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, errors });
    }

    const {
        street, surburb, city, province, country, coordinates,
        email, name, phone,
        isPothole, confidenceScore, severity,
        userId
    } = req.body;

    // 3. Upload image to Supabase Storage
    const fileName = `pothole-${Date.now()}-${path.basename(req.file.originalname || req.file.filename || 'image.jpg')}`;
    const imageUrl = await uploadImage(req.file.path, fileName, req.file.mimetype);

    // 4. Delete temp file from disk after upload
    fs.unlink(req.file.path, (err) => {
        if (err) console.warn('⚠️  Could not delete temp file:', req.file.path);
    });

    // 5. Build and save the pothole document
    const pothole = new Pothole({
        userId,
        imageUrl,
        location: {
            type: 'Point',
            coordinates,
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

    if (saved.reportedBy && saved.reportedBy.email) {
        agenda.now('send-status-email', {
            email: saved.reportedBy.email,
            name: saved.reportedBy.name,
            status: saved.status,
            potholeId: saved._id
        });
    }

    return res.status(201).json({
        success: true,
        message: 'Pothole reported successfully',
        data: saved,
    });
});

/**
 * GET /api/potholes
 */
const getAllPotholes = asyncCatch(async (req, res, next) => {
    const potholes = await Pothole.find().sort({ createdAt: -1 });
    return res.status(200).json({
        success: true,
        data: potholes
    });
});

/**
 * DELETE /api/potholes/:id
 */
const deletePothole = asyncCatch(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Pothole.findByIdAndDelete(id);
    if (!deleted) {
        return next(new AppError('Pothole report not found.', 404));
    }

    return res.status(200).json({
        success: true,
        message: 'Pothole report deleted successfully'
    });
});

/**
 * PATCH /api/potholes/:id/status
 */
const updatePotholeStatus = asyncCatch(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['reported', 'verified', 'assigned', 'in_progress', 'repaired', 'rejected'];
    if (!validStatuses.includes(status)) {
        return next(new AppError(`Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}.`, 400));
    }

    const updated = await Pothole.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!updated) {
        return next(new AppError('Pothole report not found.', 404));
    }

    if (updated.reportedBy && updated.reportedBy.email) {
        agenda.now('send-status-email', {
            email: updated.reportedBy.email,
            name: updated.reportedBy.name,
            status: updated.status,
            potholeId: updated._id
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: updated
    });
});

/**
 * PUT /api/potholes/:id/reporter
 */
const updatePotholeReporter = asyncCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, phone } = req.body;

    const pothole = await Pothole.findById(id);
    if (!pothole) {
        return next(new AppError('Pothole report not found.', 404));
    }

    if (name !== undefined) pothole.reportedBy.name = name;
    if (phone !== undefined) pothole.reportedBy.phone = phone;

    const updated = await pothole.save();
    return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated
    });
});

module.exports = { reportPothole, getAllPotholes, deletePothole, updatePotholeStatus, updatePotholeReporter };
