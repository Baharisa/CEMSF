const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 GET user information (Protected)
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // userId is set in authMiddleware
        const result = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET upcoming events (Protected)
router.get('/upcoming-events', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Assume userId is used to filter events related to the user
        const result = await pool.query('SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC');

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET statistics (Protected)
router.get('/statistics', authMiddleware, async (req, res) => {
    try {
        const totalEvents = await pool.query('SELECT COUNT(*) FROM events');
        const totalAttendees = await pool.query('SELECT COUNT(*) FROM registrations');

        res.json({
            totalEvents: parseInt(totalEvents.rows[0].count),
            totalAttendees: parseInt(totalAttendees.rows[0].count),
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET recent activity (Protected)
router.get('/recent-activity', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Assume you want to fetch activities for the logged-in user
        const result = await pool.query('SELECT action, date FROM activity_log WHERE user_id = $1 ORDER BY date DESC LIMIT 10', [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;