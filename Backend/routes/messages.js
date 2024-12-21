const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/send', async (req, res) => {
    try {
        const { booking_id, sender_id, receiver_id, message } = req.body;
        
        const newMessage = await pool.query(
            'INSERT INTO messages (booking_id, sender_id, receiver_id, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [booking_id, sender_id, receiver_id, message]
        );

        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [receiver_id, 'New Message', 'You have received a new message', 'message']
        );

        res.json(newMessage.rows[0]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/booking/:id', async (req, res) => {
    try {
        const messages = await pool.query(`
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.booking_id = $1
            ORDER BY m.created_at ASC
        `, [req.params.id]);
        res.json(messages.rows);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/read', async (req, res) => {
    try {
        const { booking_id, user_id } = req.body;
        await pool.query(
            'UPDATE messages SET read = true WHERE booking_id = $1 AND receiver_id = $2',
            [booking_id, user_id]
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;