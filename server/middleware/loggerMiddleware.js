const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' :  // red
      res.statusCode >= 400 ? '\x1b[33m' :  // yellow
      res.statusCode >= 300 ? '\x1b[36m' :  // cyan
      '\x1b[32m';                            // green

    const reset = '\x1b[0m';
    const user = req.user ? `[${req.user.email}]` : '[guest]';

    console.log(
      `${timestamp} ${statusColor}${res.statusCode}${reset} ${req.method} ${req.originalUrl} ${user} ${duration}ms`
    );
  });

  next();
};

module.exports = loggerMiddleware;
