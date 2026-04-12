const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const connectDB = require('./common/db');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
    projectId: "zimroads-d3cbd"
});

const app = express();
const port = process.env.PORT || 5002;

// ─── Security: HTTP Headers ─────────────────────────────────────────────────
// Helmet adds headers like X-Frame-Options, X-Content-Type-Options, etc.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow /uploads images to load in the browser
}));

// ─── Security: Strict CORS ───────────────────────────────────────────────────
// Only allow requests from the Vite dev frontend or production URL
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL, // Set this in .env for production (e.g. https://roadports.vercel.app)
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Parsers ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Prevent oversized JSON payloads
app.use(express.urlencoded({ extended: true }));

// ─── Security: NoSQL Injection Sanitization ───────────────────────────────────
// express-mongo-sanitize can't overwrite req.query in newer Express versions.
// Instead apply sanitization explicitly to req.body where injection risk lives.
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }
    next();
});

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ─── Static File Serving ──────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Rate Limiters ─────────────────────────────────────────────────────────────
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, message: "Report limit reached. Please wait before submitting more." },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Routes ────────────────────────────────────────────────────────────────────
const potholeRoutes = require('./serviceRoute/routes');

// NOTE: reportLimiter is now applied BEFORE the route handler (was broken before)
app.use('/api/potholes', reportLimiter, potholeRoutes);

// General limiter on all other API routes
app.use('/api/', generalLimiter);

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    // CORS errors
    if (err.message?.startsWith('CORS policy')) {
        return res.status(403).json({ success: false, message: err.message });
    }
    // Multer file errors (wrong file type etc.)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
    }
    console.error('[Global Error]', err.message);
    res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

// ─── Database & Server ─────────────────────────────────────────────────────────
connectDB();

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
