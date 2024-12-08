// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const moment = require('moment');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 GET all events with pagination (Protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM events ORDER BY date ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    // Format dates as MM/DD/YYYY
    result.rows.forEach(event => {
      event.date = moment(event.date).format('MM/DD/YYYY');
    });

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟢 GET a single event by ID (Protected)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟢 POST a new event (Protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, date, description, location } = req.body;

  // Check for missing fields
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Title, Date, and Location are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO events (title, date, description, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, date, description, location]
    );

    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟢 PUT (Update) an event by ID (Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, date, description, location } = req.body;

  // Check for missing fields
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Title, Date, and Location are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE events SET title = $1, date = $2, description = $3, location = $4 WHERE id = $5 RETURNING *',
      [title, date, description, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟢 DELETE an event by ID (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully', event: result.rows[0] });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
