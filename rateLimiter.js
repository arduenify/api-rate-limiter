const sqlite3 = require('sqlite3').verbose();
let db;

// Initialize database
db = new sqlite3.Database(':memory:');
db.run(
    'CREATE TABLE IF NOT EXISTS rate_limit (ip TEXT, count INTEGER, expire_time INTEGER)'
);

// Runs a query and returns a promise
const runAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// Gets a single wrapped result row as a promise
const getAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, function (err, row) {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Sets the rate limit headers
const setRateLimitHeaders = (
    res,
    maxRequests,
    requestCount,
    windowInSeconds
) => {
    res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': maxRequests - requestCount,
        'X-RateLimit-Reset': windowInSeconds,
    });
};

// Returns an async middleware function that rate limits incoming requests
module.exports = function createRateLimiter({
    maxRequests = 100,
    windowInSeconds = 900,
}) {
    return async (req, res, next) => {
        const ip = req.ip;
        const key = `rate_limit:${ip}`;

        try {
            // Gets the row for the current IP, creates a new one if it doesn't exist
            let row = await getAsync('SELECT * FROM rate_limit WHERE ip = ?', [
                key,
            ]);
            const currentTime = Math.floor(Date.now() / 1000);

            if (!row) {
                await runAsync(
                    'INSERT INTO rate_limit(ip, count, expire_time) VALUES(?, ?, ?)',
                    [key, 1, currentTime + windowInSeconds]
                );
            } else {
                // Resets the count if the window has expired, else incremenets
                if (currentTime > row.expire_time) {
                    await runAsync(
                        'UPDATE rate_limit SET count = ?, expire_time = ? WHERE ip = ?',
                        [1, currentTime + windowInSeconds, key]
                    );
                } else {
                    await runAsync(
                        'UPDATE rate_limit SET count = count + 1 WHERE ip = ?',
                        [key]
                    );
                }
            }

            // Checks whether the request is over the limit
            row = await getAsync('SELECT * FROM rate_limit WHERE ip = ?', [
                key,
            ]);
            const requestCount = row.count;
            if (requestCount > maxRequests) {
                return res.status(429).json({ message: 'Rate limit exceeded' });
            }

            // Sets the rate limit headers
            setRateLimitHeaders(
                res,
                maxRequests,
                requestCount,
                windowInSeconds
            );

            // Passes the request to the next middleware
            next();
        } catch (err) {
            console.error('SQLite query failed:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};
