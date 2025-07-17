const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'User recently changed password. Please log in again.'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Check if user is admin or HR
const isAdminOrHR = (req, res, next) => {
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or HR role required.'
    });
  }
  next();
};

// Check if user is admin, HR, or manager
const isManagerOrAbove = (req, res, next) => {
  if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager role or above required.'
    });
  }
  next();
};

// Check if user can access employee data (own data or if admin/hr/manager)
const canAccessEmployeeData = (req, res, next) => {
  const employeeId = req.params.employeeId || req.body.employeeId;
  
  if (req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'manager') {
    return next();
  }
  
  if (req.user.employeeId === employeeId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own data.'
  });
};

module.exports = {
  protect,
  restrictTo,
  isAdminOrHR,
  isManagerOrAbove,
  canAccessEmployeeData
};