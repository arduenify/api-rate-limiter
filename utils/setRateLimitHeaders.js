// Sets the rate limit headers
const setRateLimitHeaders = (
    res,
    maxRequests,
    requestCount,
    windowInSeconds
  ) => {
    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": maxRequests - requestCount,
      "X-RateLimit-Reset": windowInSeconds,
    });
  };
  module.exports = setRateLimitHeaders;
  