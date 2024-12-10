const jwt = require('jsonwebtoken');

// Middleware for authenticating requests using JWT
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization'); // Retrieve Authorization header

    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract token from the header
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role }; // Attach user data to the request object
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Token is not valid or expired' });
  }
};

module.exports = authMiddleware;