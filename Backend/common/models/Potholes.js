const mongoose = require('mongoose');

const potholeSchema = new mongoose.Schema({
    // image url
    imageUrl: {
        type: String,
        required: [true, 'An image is required for verification'],
    },

    // GeoLocation for precise location of the pothole
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    // Metadata for the ministry
    address: {
        street: String,
        surburb: String,
        city: { type: String, default: 'Johannesburg' },
        province: { type: String, default: 'Gauteng' },
        country: { type: String, default: 'South Africa' }
    },

    // AI verification Data
    verification: {
        isPothole: { type: Boolean, default: false },
        confidenceScore: { type: Number, default: 0.0 },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        },
        verifiedBy: {
            type: String,
            enum: ['ai', 'human'],
            default: 'ai'
        },
        verifiedAt: {
            type: Date,
            default: Date.now
        }
    },

    // Workflow Status
    status: {
        type: String,
        enum: ['reported', 'verified', 'dispatched', 'repaired', 'rejected'],
        default: 'reported'
    },

    // Citizen info (Optional for follow ups)
    reportedBy: {
        email: String,
        name: String,
        phone: String,
    }

}, { timestamps: true });

potholeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pothole', potholeSchema);