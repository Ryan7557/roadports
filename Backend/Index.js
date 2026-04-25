const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();
const connectDB = require('./common/config/db');
const admin = require('firebase-admin');
const globalErrorHandler = require('./common/middlewares/errorHandler');

// Initialize background jobs
const agenda = require('./common/jobs/agenda');
require('./common/jobs/emailJob')(agenda);

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

// ─── Security: Parameter Pollution Protection ───────────────────────────────
app.use(hpp());

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
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1000, // TODO: lower back to 10 before production
    message: { success: false, message: "Daily report limit reached. Please wait 24 hours before submitting more data." },
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
// Must be registered LAST — after all routes and middleware.
// Express identifies this as an error handler because it takes 4 arguments: (err, req, res, next)
app.use(globalErrorHandler);

// ─── Database & Server ─────────────────────────────────────────────────────────
connectDB();

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
