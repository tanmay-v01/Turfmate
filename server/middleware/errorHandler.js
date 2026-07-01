const logger = require('../lib/logger');

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.originalUrl} does not exist.` });
}

function globalErrorHandler(err, req, res, next) {
  logger.error('unhandled_error', { 
    message: err.message, 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  const statusCode = err.statusCode || err.status || 500;
  const errorResponse = {
    error: err.name || 'Internal Server Error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred.' 
      : err.message
  };

  res.status(statusCode).json(errorResponse);
}

module.exports = { notFoundHandler, globalErrorHandler };
