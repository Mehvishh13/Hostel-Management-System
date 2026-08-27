// utils/exposeError.js - Only leak internal error details outside production.
const { isProduction } = require('../config/env');

module.exports = function exposeError(error) {
  return isProduction ? undefined : error && error.message;
};
