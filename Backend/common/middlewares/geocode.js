const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({
    provider: 'openstreetmap',
    // Nominatim requires a User-Agent header to identify the app
    userAgent: 'roadports-app',
    language: 'en',
});

/**
 * Geocode Middleware
 * Reads address fields from req.body, looks up coordinates via OpenStreetMap
 * Nominatim, and attaches them as `req.body.coordinates` [lng, lat].
 */
const geocodeAddress = async (req, res, next) => {
    // If coordinates are already passed (from map pinning), skip OpenStreetMap lookups
    if (req.body.coordinates) {
        if (typeof req.body.coordinates === 'string') {
            try {
                req.body.coordinates = JSON.parse(req.body.coordinates);
            } catch (e) {
                req.body.coordinates = req.body.coordinates.split(',').map(Number);
            }
        }
        return next();
    }

    const { street, surburb, city, province, country } = req.body;

    // Build a human-readable address string for the geocoder
    const addressParts = [street, surburb, city, province, country].filter(Boolean);

    if (addressParts.length === 0) {
        // Fallback for when no address nor coordinates are provided
        return res.status(400).json({
            success: false,
            message: 'A map pin or at least one address field is required to determine the location.',
        });
    }

    const addressQuery = addressParts.join(', ');

    try {
        const results = await geocoder.geocode(addressQuery);

        if (!results || results.length === 0) {
            return res.status(422).json({
                success: false,
                message: `Could not find coordinates for the address: "${addressQuery}". Please check the address and try again.`,
            });
        }

        const { longitude, latitude } = results[0];

        // Attach coordinates in GeoJSON order: [lng, lat]
        req.body.coordinates = [parseFloat(longitude), parseFloat(latitude)];

        next();
    } catch (err) {
        console.error('[Geocode Middleware] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Geocoding service failed. Please try again later.',
        });
    }
};

module.exports = { geocodeAddress };
