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

router.post('/send', async (req, res) => {
    try {
        // Get the booking ID, sender ID, receiver ID, and message from the request
        const { booking_id, sender_id, receiver_id, message } = req.body;

        // Create a new message in the database
        const newMessage = await pool.query(
            'INSERT INTO messages (booking_id, sender_id, receiver_id, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [booking_id, sender_id, receiver_id, message]
        );

        // Create a new notification in the database
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [receiver_id, 'New Message', 'You have received a new message', 'message']
        );

        // Return the newly created message
        res.json(newMessage.rows[0]);
    } catch (error) {
        // If there is an error, log it and return a server error message
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/booking/:id', async (req, res) => {
    try {
        // Get the booking ID from the request
        const id = req.params.id;

        // Get all the messages for the booking from the database
        const messages = await pool.query(`
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.booking_id = $1
            ORDER BY m.created_at ASC
        `, [id]);

        // Return the messages
        res.json(messages.rows);
    } catch (error) {
        // If there is an error, log it and return a server error message
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/read', async (req, res) => {
    try {
        // Get the booking ID and user ID from the request
        const { booking_id, user_id } = req.body;

        // Update all the messages for the booking to be marked as read
        await pool.query(
            'UPDATE messages SET read = true WHERE booking_id = $1 AND receiver_id = $2',
            [booking_id, user_id]
        );

        // Return a success message
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        // If there is an error, log it and return a server error message
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
