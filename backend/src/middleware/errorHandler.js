const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  try {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
      message = `A record with this ${field} already exists.`;
      statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      message = err.errors 
        ? Object.values(err.errors).map((val) => val.message).join(', ')
        : 'Validation Error';
      statusCode = 400;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
      message = `Invalid ${err.path || 'ID'}: ${err.value || 'unknown'}`;
      statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token.';
      statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
      message = 'Token has expired.';
      statusCode = 401;
    }

    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    }
  } catch (fallbackErr) {
    console.error('Error in errorHandler:', fallbackErr);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
};

module.exports = errorHandler;
