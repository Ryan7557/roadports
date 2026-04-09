const express = require('express');
const router = express.Router();

const upload = require('../common/middlewares/upload');
const { geocodeAddress } = require('../common/middlewares/geocode');
const { reportPothole, getAllPotholes, deletePothole } = require('./controller');

// POST /api/potholes  (multipart/form-data)
// Pipeline: upload image → geocode address → validate + save
router.post('/', upload.single('image'), geocodeAddress, reportPothole);

// GET /api/potholes (fetch all potholes for dashboard)
router.get('/', getAllPotholes);

// DELETE /api/potholes/:id
router.delete('/:id', deletePothole);

module.exports = router;
