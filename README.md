# Express Rate Limiter with SQLite (async-sqlite-rate-limiter)

## Overview

NPM Package Link: <https://www.npmjs.com/package/async-sqlite-rate-limiter>

This is a rate limiting middleware for Express applications using SQLite as a storage engine. It helps protect your application from abuse by limiting the number of requests that can be made from an IP address in a given time window.

## Features

- Asynchronous SQLite database operations
- Customizable rate limiting parameters
- Sets standard rate-limiting headers

## Installation

To install this package, run the following command:
```npm install async-sqlite-rate-limiter```

## Configuration Options

The `createRateLimiter` function accepts an options object with the properties:

`maxRequests` (optional): The maximum number of requests allowed per client in the specified time window. Defaults to 100.

`windowInSeconds` (optional): The length of the time window in seconds. Default is 900 (15 minutes).

## Response Headers

This middleware sets the following headers on all responses:

`X-RateLimit-Limit`: The maximum number of requests allowed in a time window

`X-RateLimit-Remaining`: The number of requests remaining in the current time window

`X-RateLimit-Reset`: The time (in seconds) until the time window resets.

## Contributing

If you'd like to contribute, please fork the repository and make any changes you'd like. Pulls requests are warmly welcome.

## Usage

```javascript
const express = require('express');
const createRateLimiter = require('async-sqlite-rate-limiter');

const app = express();
const port = 3000;

// Initialize the rate limiter middleware
const rateLimitMiddleware = createRateLimiter({
    maxRequests: 5,        // Maximum 5 requests
    windowInSeconds: 60    // Within 60 seconds
});

// Use the rate limiter middleware on a route
app.use('/test', rateLimitMiddleware);

// Define the test route
app.get('/test', (req, res) => {
    res.send('This is a rate-limited route.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
```

## License

This project is licensed under the MIT License (see [LICENSE.md](LICENSE.md) for details)
