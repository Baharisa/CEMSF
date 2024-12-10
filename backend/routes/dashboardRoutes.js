const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 GET dashboard statistics (Protected)
router.get('/statistics', authMiddleware, async (req, res) => {
    try {
        // Fetch total events, upcoming events, and total users in parallel for better performance
        const totalEventsPromise = pool.query('SELECT COUNT(*) FROM events');
        const upcomingEventsPromise = pool.query('SELECT COUNT(*) FROM events WHERE date >= NOW()');
        const totalUsersPromise = pool.query('SELECT COUNT(*) FROM users');
        
        const [totalEventsResult, upcomingEventsResult, totalUsersResult] = await Promise.all([
            totalEventsPromise,
            upcomingEventsPromise,
            totalUsersPromise
        ]);

        res.json({
            totalEvents: parseInt(totalEventsResult.rows[0].count, 10),
            upcomingEvents: parseInt(upcomingEventsResult.rows[0].count, 10),
            totalUsers: parseInt(totalUsersResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
        const result = await pool.query('SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET total events (Protected)
router.get('/total-events', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM events');
        res.json({ totalEvents: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        console.error('Error fetching total events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET total users (Protected)
router.get('/total-users', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM users');
        res.json({ totalUsers: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        console.error('Error fetching total users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET total registrations (Protected)
router.get('/total-registrations', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM registrations');
        res.json({ totalRegistrations: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        console.error('Error fetching total registrations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🟢 GET recent activity (Protected)
router.get('/recent-activity', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const result = await pool.query(
            'SELECT action, date FROM activity_log WHERE user_id = $1 ORDER BY date DESC LIMIT 10', 
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
