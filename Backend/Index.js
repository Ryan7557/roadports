const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./common/db');

const app = express();
const port = process.env.PORT || 5001;


// Middleware
app.use(cors());
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Serve uploaded images statically → GET /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Strict limiter for reporting pothole routes
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Report limit reached. Please wait an hour before submitting more data.",
});

// Routes
const potholeRoutes = require('./serviceRoute/routes');
app.use('/api/potholes', potholeRoutes, reportLimiter);

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});


// Apply rate limiter to all API routes
app.use('/api/', generalLimiter);

// Connect to MongoDb
connectDB();

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
