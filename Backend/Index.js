const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();
const connectDB = require('./common/config/db');
const admin = require('firebase-admin');
const globalErrorHandler = require('./common/middlewares/errorHandler');
const compression = require('compression');
const morgan = require('morgan');

// Initialize background jobs
const agenda = require('./common/jobs/agenda');
require('./common/jobs/emailJob')(agenda);

// Initialize Firebase Admin
admin.initializeApp({
    projectId: "zimroads-d3cbd"
});

const app = express();
const port = process.env.PORT || 5002;

// Enable 'trust proxy' if behind a proxy (Heroku, Vercel, Nginx, etc.)
// This is critical for express-rate-limit to see the real client IP.
app.set('trust proxy', 1);

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(compression()); // Compress all responses
app.use(morgan('combined')); // Production-grade logging

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

const { generalLimiter } = require('./common/middlewares/rateLimiters');

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
// Images are now stored on Supabase Storage — no local /uploads directory needed.

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'Roadports AI API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
const potholeRoutes = require('./serviceRoute/routes');

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// Pothole routes
app.use('/api/potholes', potholeRoutes);

// ─── Global Error Handler ──────────────────────────────────────────────────────
// Must be registered LAST — after all routes and middleware.
// Express identifies this as an error handler because it takes 4 arguments: (err, req, res, next)
app.use(globalErrorHandler);

const { verifyConnection: verifySupabase } = require('./common/services/supabase');

// ─── Database & Server ─────────────────────────────────────────────────────────
connectDB();
verifySupabase();

    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
