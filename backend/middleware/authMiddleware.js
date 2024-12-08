// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Extract the Authorization header, expected format: "Bearer <token>"
  const authHeader = req.header('Authorization');

  // If no Authorization header is provided
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  // Remove "Bearer " prefix from the header to extract the token
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user ID from the token payload to req.user for future middleware/routes
    req.user = decoded.userId;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
