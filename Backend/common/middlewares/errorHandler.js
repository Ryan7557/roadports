/**
 * Global Error Handler Middleware
 *
 * HOW IT WORKS:
 * In Express, any middleware with FOUR arguments (err, req, res, next)
 * is automatically treated as an ERROR-HANDLING middleware. Express calls
 * it ONLY when an error is passed via `next(err)` or when `throw` is used
 * inside an async function wrapped with asyncCatch().
 *
 * This single function is the ONE place in the entire backend that sends
 * error responses. Every route just throws/passes the error — this catches it all.
 */

const AppError = require('../utils/AppError');

// ─── handleCastError ────────────────────────────────────────────────────────
// Mongoose throws a 'CastError' when you pass an invalid MongoDB ObjectId
// e.g. GET /api/potholes/not-a-real-id
function handleCastError(err) {
    const message = `Invalid ${err.path}: "${err.value}". Please provide a valid ID.`;
    return new AppError(message, 400);
}

// ─── handleValidationError ───────────────────────────────────────────────────
// Mongoose throws a 'ValidationError' when a schema rule is violated
// e.g. a required field is missing when saving a document
function handleValidationError(err) {
    const messages = Object.values(err.errors).map(e => e.message);
    return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
}

// ─── handleDuplicateKeyError ─────────────────────────────────────────────────
// MongoDB throws error code 11000 when a unique field is duplicated
// e.g. trying to create a user with an email that already exists
function handleDuplicateKeyError(err) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new AppError(`Duplicate value "${value}" for field "${field}". Please use a different value.`, 409);
}

// ─── sendErrorResponse ───────────────────────────────────────────────────────
// Decides WHAT to send back based on whether it's our controlled error or a crash.
function sendErrorResponse(err, res) {
    // OPERATIONAL errors: we created these with `new AppError(...)`.
    // They are safe to send details to the client.
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // PROGRAMMING / UNEXPECTED errors: a real crash (bug in code, DB down, etc.)
    // We log the full error server-side but send a generic message to the client
    // so we don't leak internal details (stack traces, file paths, etc.)
    console.error('💥 UNEXPECTED ERROR:', err);
    return res.status(500).json({
        success: false,
        message: 'Something went wrong on our end. Please try again later.',
    });
}

// ─── The Global Error Handler ────────────────────────────────────────────────
// Must be registered LAST in Index.js, after all routes.
function globalErrorHandler(err, req, res, next) {
    // ① Log every error that comes through (always useful for debugging)
    console.error(`[Error] ${req.method} ${req.originalUrl} → ${err.message}`);

    // ② Start with the error as-is
    let error = err;

    // ─ Translate known library errors into our AppError format ───────────────

    // CORS error (thrown by the cors() middleware)
    if (err.message?.startsWith('CORS policy')) {
        error = new AppError(err.message, 403);
    }

    // Multer file too large
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new AppError('File too large. Maximum allowed size is 5MB.', 413);
    }

    // Multer wrong file type
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = new AppError('Unexpected file field. Use "image" as the field name.', 400);
    }

    // Mongoose: Invalid ObjectId (e.g. /api/potholes/abc123)
    if (err.name === 'CastError') {
        error = handleCastError(err);
    }

    // Mongoose: Schema validation failed
    if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    }

    // MongoDB: Duplicate unique field
    if (err.code === 11000) {
        error = handleDuplicateKeyError(err);
    }

    // Firebase: Invalid or expired auth token
    if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
        error = new AppError('Authentication token is invalid or has expired. Please sign in again.', 401);
    }

    // ③ Send the final response
    sendErrorResponse(error, res);
}

module.exports = globalErrorHandler;
