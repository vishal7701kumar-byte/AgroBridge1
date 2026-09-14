const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'agrobridge_secure_jwt_secret_key_2026_auth';

// Generate JWT containing userId and role
function generateToken(user) {
  const userId = user._id ? user._id.toString() : user.userId;
  return jwt.sign(
    {
      userId: userId,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
}

// Protected route middleware: verifies token
async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userService.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User belonging to this token no longer exists.'
      });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid authentication token.'
    });
  }
}

// Role-based authorization middleware
function authorize(...roles) {
  const normalizedRoles = roles.map(r => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user || !normalizedRoles.includes(req.user.role.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. This resource is restricted to [${normalizedRoles.join(', ')}] roles. Your role is '${req.user ? req.user.role : 'UNKNOWN'}'.`
      });
    }
    next();
  };
}

// Global error handler middleware
function errorHandler(err, req, res, next) {
  console.error('💥 Server Error:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'An account with this email address already exists.';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = {
  JWT_SECRET,
  generateToken,
  protect,
  authorize,
  errorHandler
};
