const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const eventRoutes = require('./routes/eventRoutes'); // Import event routes
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const authMiddleware = require('./middleware/authMiddleware'); // Import the authentication middleware

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('CEMS Backend is running!');
});

// Authentication routes for login and register
app.use('/api/auth', authRoutes); // Use authRoutes for /api/auth

// Event routes (protected by JWT)
app.use('/api/events', authMiddleware, eventRoutes); // Use eventRoutes for /api/events, protected by authMiddleware

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
