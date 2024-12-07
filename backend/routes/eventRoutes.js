const express = require('express'); 
const router = express.Router();
const pool = require('../config/db'); // Import PostgreSQL connection pool
const moment = require('moment'); // Import moment.js for date formatting

// GET all events with pagination
router.get('/', async (req, res) => {
  try {
    // Extract page and limit from query parameters (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Fetch events with pagination
    const result = await pool.query(
      'SELECT * FROM events ORDER BY date ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    // Format the date using moment.js for all events
    result.rows.forEach(event => {
      event.date = moment(event.date).format('MM/DD/YYYY');
    });

    res.json(result.rows); // Send event data as JSON response
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET a single event by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Format the date using moment.js (MM/DD/YYYY format)
    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');

    // Send the formatted event data as JSON response
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new event
router.post('/', async (req, res) => {
  const { title, date, description, location } = req.body;

  try {
    // Insert the event into the database
    const result = await pool.query(
      'INSERT INTO events (title, date, description, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, date, description, location]
    );

    // Format the inserted event date
    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');

    // Send the newly created event as a JSON response
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (Update) an event by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, date, description, location } = req.body;

  try {
    const result = await pool.query(
      'UPDATE events SET title = $1, date = $2, description = $3, location = $4 WHERE id = $5 RETURNING *',
      [title, date, description, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');
    res.json(result.rows[0]); // Send updated event
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE an event by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
