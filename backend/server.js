const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const eventRoutes = require('./routes/eventRoutes'); // Import event routes
const authRoutes = require('./routes/authRoutes');   // Import authentication routes
const authMiddleware = require('./middleware/authMiddleware'); // Import authentication middleware
const { Pool } = require('pg'); // Import PostgreSQL client

// Load environment variables from .env file
dotenv.config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER, // Your PostgreSQL username
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME, // Your database name
  password: process.env.DB_PASSWORD, // Your PostgreSQL password
  port: process.env.DB_PORT || 5432,
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route to verify server is running
app.get('/', (req, res) => {
  res.send('CEMS Backend is running!');
});

// Authentication routes for login and register
app.use('/api/auth', authRoutes);

// Protected event routes 
// Applying authMiddleware here means all routes in eventRoutes require a valid token
app.use('/api/events', authMiddleware, eventRoutes);

// Get events by date
app.get('/api/events', async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query('SELECT * FROM events WHERE date = $1', [date]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});