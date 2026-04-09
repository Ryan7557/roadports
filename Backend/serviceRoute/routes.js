const express = require('express');
const router = express.Router();

const upload = require('../common/middlewares/upload');
const { geocodeAddress } = require('../common/middlewares/geocode');
const { reportPothole, getAllPotholes } = require('./controller');

// POST /api/potholes  (multipart/form-data)
// Pipeline: upload image → geocode address → validate + save
router.post('/', upload.single('image'), geocodeAddress, reportPothole);

// GET /api/potholes (fetch all potholes for dashboard)
router.get('/', getAllPotholes);

module.exports = router;
