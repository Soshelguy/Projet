const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/user/:id', async (req, res) => {
    try {
        const notifications = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.id]
        );
        res.json(notifications.rows);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/read', async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET read = true WHERE id = $1',
            [req.params.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;