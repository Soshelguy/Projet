/**
 * This file contains functions for sending and retrieving messages, as well as marking them as read.
 * 
 * The send function sends a message from one user to another in the context of a booking.
 * It takes the booking ID, the sender's ID, the receiver's ID, and the message.
 * It returns the newly created message.
 * 
 * The get function retrieves all the messages for a booking, sorted in ascending order by creation time.
 * It takes the booking ID.
 * It returns an array of messages.
 * 
 * The read function marks all the messages for a booking as read.
 * It takes the booking ID and the user ID.
 * It returns a success message.
 * 
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateUser = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/token');


// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'ggg Invalid or expired token' });
        req.user = { userId: user.userId, email: user.email };
        next();
    });
};

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
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


// Get messages for a booking
router.get('/booking/:id', authenticateToken, async (req, res) => {
    try {
      const bookingId = req.params.id;
      console.log(`Fetching messages for booking: ${bookingId}`);
  
      const messages = await pool.query(`
        SELECT m.*, u.name AS sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.booking_id = $1
        ORDER BY m.created_at ASC
      `, [bookingId]);
  
      console.log(`Found ${messages.rows.length} messages.`);
      // Even if messages.rows is empty, that should just return [] and not an error
      return res.json(messages.rows);
    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Mark messages as read
router.put('/read', authenticateToken, async (req, res) => {
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
