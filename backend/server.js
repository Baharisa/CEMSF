const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Import routes
const eventRoutes = require('./routes/eventRoutes'); // Event-related routes
const authRoutes = require('./routes/authRoutes');   // Authentication routes
const authMiddleware = require('./middleware/authMiddleware'); // Authentication middleware

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

// Authentication routes for login and registration
app.use('/api/auth', authRoutes);

// Protected event routes (requires valid token)
app.use('/api/events', authMiddleware, eventRoutes);

// Route to get events by date
app.get('/api/events/date', async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query('SELECT * FROM events WHERE date = $1', [date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events by date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to create a new event
app.post('/api/events', async (req, res) => {
  const { title, date, description, location, userId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO events (title, date, description, location, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, date, description, location, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to delete an event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🟢 Route to fetch dashboard statistics
app.get('/api/dashboard/statistics', authMiddleware, async (req, res) => {
  try {
    const totalEvents = await pool.query('SELECT COUNT(*) FROM events');
    const upcomingEvents = await pool.query('SELECT COUNT(*) FROM events WHERE date >= NOW()');
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      totalEvents: parseInt(totalEvents.rows[0].count, 10),
      upcomingEvents: parseInt(upcomingEvents.rows[0].count, 10),
      totalUsers: parseInt(totalUsers.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
