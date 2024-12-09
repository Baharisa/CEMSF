const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const moment = require('moment');
const authMiddleware = require('../middleware/authMiddleware');

// Centralized error handling
const catchAsync = (fn) => (req, res, next) =>
    fn(req, res, next).catch(next);

// 🟢 GET all events with pagination (Protected)
router.get('/', authMiddleware, catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const result = await pool.query(
        'SELECT * FROM events ORDER BY date ASC LIMIT $1 OFFSET $2',
        [limit, offset]
    );

    result.rows.forEach(event => {
        event.date = moment(event.date).format('MM/DD/YYYY');
    });

    res.json(result.rows);
}));

// 🟢 POST a new event (Protected)
router.post('/', authMiddleware, catchAsync(async (req, res) => {
    const { title, date, description, location } = req.body;

    // Validate required fields
    if (!title || !date || !location) {
        return res.status(400).json({ error: 'Title, Date, and Location are required' });
    }

    // Insert new event into the database
    const result = await pool.query(
        'INSERT INTO events (title, date, description, location) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, date, description, location]
    );

    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');
    res.status(201).json(result.rows[0]);
}));

// 🟢 UPDATE an existing event (Protected)
router.put('/:id', authMiddleware, catchAsync(async (req, res) => {
    const { title, date, description, location } = req.body;
    const eventId = req.params.id;

    if (!title || !date || !location) {
        return res.status(400).json({ error: 'Title, Date, and Location are required' });
    }

    const result = await pool.query(
        'UPDATE events SET title = $1, date = $2, description = $3, location = $4 WHERE id = $5 RETURNING *',
        [title, date, description, location, eventId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Event not found' });
    }

    result.rows[0].date = moment(result.rows[0].date).format('MM/DD/YYYY');
    res.json(result.rows[0]);
}));

// 🟢 DELETE an event (Protected)
router.delete('/:id', authMiddleware, catchAsync(async (req, res) => {
    const eventId = req.params.id;

    const result = await pool.query(
        'DELETE FROM events WHERE id = $1 RETURNING *',
        [eventId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
}));

// 🟢 Register for an event (Protected)
router.post('/register', authMiddleware, catchAsync(async (req, res) => {
    const { name, email, eventId } = req.body;

    // Validate required fields
    if (!name || !email || !eventId) {
        return res.status(400).json({ error: 'Name, Email, and Event ID are required' });
    }

    // Save registration to the database
    await pool.query('INSERT INTO registrations (name, email, event_id) VALUES ($1, $2, $3)', [name, email, eventId]);
    res.status(201).json({ message: 'Registration successful' });
}));

module.exports = router;