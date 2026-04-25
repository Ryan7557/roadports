/**
 * AppError — A custom operational error class.
 *
 * HOW IT WORKS:
 * JavaScript's built-in `Error` class only carries a `message` string.
 * This class EXTENDS it to also carry:
 *   - `statusCode`: the HTTP status to send back (e.g. 400, 404, 403)
 *   - `isOperational`: a flag to distinguish OUR expected errors (like "user not found")
 *     from unexpected crashes (like a database connection dropping).
 *
 * Usage anywhere in your app:
 *   throw new AppError('Pothole not found', 404);
 *   throw new AppError('You are not authorized', 403);
 */
class AppError extends Error {
    constructor(message, statusCode) {
        // Call the parent Error constructor with the message
        super(message);

        this.statusCode = statusCode;

        // 4xx errors are "client" errors (operational), 5xx are server crashes.
        // We use this flag in the error handler to decide the response format.
        this.isOperational = true;

        // Captures the exact line in the code where the error was thrown,
        // which makes debugging much easier.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
