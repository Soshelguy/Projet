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
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = { userId: user.userId, email: user.email };
        next();
    });
};
// Update message send endpoint
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { booking_id, sender_id, receiver_id, text } = req.body;

        // Validate required fields
        if (!booking_id || !sender_id || !receiver_id || !text) {
            console.error('Missing required fields:', { booking_id, sender_id, receiver_id, text });
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: { booking_id, sender_id, receiver_id, text }
            });
        }

        // First get chat room ID
        const chatRoomResult = await pool.query(
            'SELECT id FROM chat_rooms WHERE booking_id = $1',
            [booking_id]
        );

        if (chatRoomResult.rows.length === 0) {
            return res.status(400).json({ error: 'No chat room found for this booking' });
        }

        const chat_room_id = chatRoomResult.rows[0].id;

        // Insert message with all required fields
        const newMessage = await pool.query(
            `INSERT INTO messages 
            (booking_id, sender_id, receiver_id, text, created_at, chat_room_id) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5) 
            RETURNING *`,
            [booking_id, sender_id, receiver_id, text, chat_room_id]
        );
        
        console.log('Message created:', newMessage.rows[0]);
        return res.json(newMessage.rows[0]);
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});
// Mark messages as read
router.put('/read', authenticateToken, async (req, res) => {
    try {
        const { booking_id, user_id } = req.body;
        console.log('Marking messages as read:', { booking_id, user_id });

        // Update read status
        const result = await pool.query(
            `UPDATE messages 
             SET read = true 
             WHERE booking_id = $1 
             AND receiver_id = $2 
             AND read = false
             RETURNING id`,
            [booking_id, user_id]
        );

        if (result.rows.length > 0) {
            // Emit socket event for real-time updates
            const io = req.app.get('io');
            io.to(`booking_${booking_id}`).emit('messagesRead', {
                booking_id,
                reader_id: user_id
            });
        }
        else {
            console.log('No messages marked as read or io not available');
        }
        res.json({ 
            success: true,
            updated: result.rows.length 
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to update read status' });
    }
});

router.get('/booking/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.userId;
        console.log('Fetching messages for booking:', bookingId);

        const messages = await pool.query(
            `SELECT 
                m.*, 
                u1.full_name as sender_name,
                u2.full_name as receiver_name,
                m.read,
                (SELECT COUNT(*) 
                 FROM messages 
                 WHERE booking_id = $1 
                 AND receiver_id = $2 
                 AND read = false) as unread_count
             FROM messages m
             LEFT JOIN users u1 ON m.sender_id = u1.id
             LEFT JOIN users u2 ON m.receiver_id = u2.id
             WHERE m.booking_id = $1 
             ORDER BY m.created_at ASC`,
            [bookingId, userId]
        );

        console.log('Found messages:', messages.rows.length);

        const response = {
            messages: messages.rows,
            unread_count: parseInt(messages.rows[0]?.unread_count || 0)
        };

        return res.json(response);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
module.exports = router;
