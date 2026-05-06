const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for reporting new potholes.
 * Prevents spamming the AI and Database.
 */
const reportLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Daily limit per IP for production
    message: { 
        success: false, 
        message: "Daily report limit reached. Please wait 24 hours before submitting more data." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General limiter for reading data (GET requests).
 * More relaxed for dashboard browsing.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 mins (plenty for dev/testing)
    message: { 
        success: false, 
        message: "Too many requests. Please try again after 15 minutes." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { reportLimiter, generalLimiter };
