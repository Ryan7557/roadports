/**
 * asyncCatch — Async Error Wrapper Utility
 *
 * HOW IT WORKS:
 * Express does NOT automatically catch errors thrown inside async functions.
 * If you write:
 *   router.get('/', async (req, res) => { throw new Error('oops'); });
 * ...Express will hang and never send a response.
 *
 * This utility WRAPS your async route handler in a Promise and catches
 * any rejection, passing it directly to Express's error pipeline via next(err).
 *
 * Instead of writing:
 *   const myController = async (req, res, next) => {
 *       try { ... } catch (err) { next(err); }
 *   };
 *
 * You write:
 *   const myController = asyncCatch(async (req, res, next) => {
 *       // No try/catch needed — asyncCatch handles it!
 *       const data = await Pothole.find();
 *       res.json({ data });
 *   });
 */
const asyncCatch = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncCatch;
