const express = require('express');
const router = express.Router();

const upload = require('../common/middlewares/upload');
const { geocodeAddress } = require('../common/middlewares/geocode');
const { verifyUser } = require('../common/middlewares/auth');
const { reportPothole, getAllPotholes, deletePothole, updatePotholeStatus } = require('./controller');

// POST /api/potholes  (multipart/form-data)
// Pipeline: upload image → verify user → geocode address → validate + save
router.post('/', upload.single('image'), verifyUser, geocodeAddress, reportPothole);

// GET /api/potholes (fetch all potholes for dashboard) - Public for now?
router.get('/', getAllPotholes);

// DELETE /api/potholes/:id
router.delete('/:id', verifyUser, deletePothole);

// PATCH /api/potholes/:id/status
router.patch('/:id/status', verifyUser, updatePotholeStatus);

module.exports = router;
