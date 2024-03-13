const setRateLimit = require('express-rate-limit');

const createRateLimiter = (windowMinutes, maxRequests, routeMessage) => {
  return setRateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    message: routeMessage,
    headers: true,
  });
};

module.exports = createRateLimiter;
