// utils/apiResponse.js
// Every endpoint answers with the same envelope:
//
//   success: { success: true, message?, data, meta? }
//   failure: { success: false, message }
//
// `data` is the payload itself (an object or an array). Anything describing
// the payload rather than being it - counts, permission flags, membership
// status - goes in `meta`.
const exposeError = require('./exposeError');

exports.ok = (res, { data = null, message, meta, status = 200 } = {}) => {
  const body = { success: true };
  if (message) body.message = message;
  body.data = data;
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

exports.created = (res, options = {}) => exports.ok(res, { ...options, status: 201 });

exports.fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

exports.notFound = (res, what = 'Resource') => exports.fail(res, 404, `${what} not found`);

exports.forbidden = (res, message = 'Not authorized') => exports.fail(res, 403, message);

// Single exit point for unexpected errors: logs the real cause, converts a
// malformed ObjectId into a 404 instead of a 500, and never leaks internals
// in production.
exports.handleError = (res, error, context, message = 'Something went wrong') => {
  console.error(`${context}:`, error);

  if (error && (error.kind === 'ObjectId' || error.name === 'CastError')) {
    return exports.fail(res, 404, 'Resource not found');
  }

  return res.status(500).json({
    success: false,
    message,
    error: exposeError(error)
  });
};
