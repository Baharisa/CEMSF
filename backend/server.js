const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables from .env file
dotenv.config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Test route to verify server is running
app.get('/', (req, res) => {
  res.send('CEMS Backend is running!');
});

// Authentication routes for login and registration
app.use('/api/auth', authRoutes);

// Protected event routes (requires valid token)
app.use('/api/events', authMiddleware, eventRoutes);

// Dashboard routes (requires valid token)
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// 🟢 Route to get events by date
app.get('/api/events/date', authMiddleware, async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query('SELECT * FROM events WHERE date = $1', [date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events by date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🟢 Route to create a new event
app.post('/api/events', authMiddleware, async (req, res) => {
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

// 🟢 Route to delete an event
app.delete('/api/events/:id', authMiddleware, async (req, res) => {
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

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
