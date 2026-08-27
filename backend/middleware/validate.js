// middleware/validate.js - Request body validation at the route boundary.
const { z } = require('zod');

// Replaces req.body with the parsed result, so controllers receive coerced,
// trimmed values and unknown keys are dropped before they reach Mongoose.
exports.validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join(', ');

    return res.status(400).json({ success: false, message });
  }

  req.body = result.data;
  next();
};

exports.z = z;
