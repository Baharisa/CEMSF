const jwt = require('jsonwebtoken');

// Auth Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from the Authorization header

  // If no token is provided
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token and decode user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user ID to the request object
    req.user = decoded.userId;

    // Allow the request to proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Token is not valid or expired' });
  }
};

module.exports = authMiddleware;











