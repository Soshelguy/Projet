/**
 * This file contains functions for creating a booking, updating the status of a booking, and
 * getting all bookings for a user.
 * 
 * The create function creates a new booking in the database. It takes the service ID, customer ID, provider ID, 
 * and an optional initial message. If the initial message is provided, it is inserted into the messages table.
 * It returns the newly created booking.
 * 
 * The updateStatus function updates the status of a booking in the database. It takes the booking ID and the new status.
 * It also inserts a notification into the notifications table to let the customer know that their booking status has changed.
 * It returns the updated booking.
 * 
 * The getByUser function retrieves all bookings for a given user. It takes the user ID and returns an array of bookings.
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Create a new booking in the database.
 * @param {Object} req.body - The request body
 * @param {number} req.body.service_id - The ID of the service
 * @param {number} req.body.customer_id - The ID of the customer
 * @param {number} req.body.provider_id - The ID of the provider
 * @param {string} [req.body.initial_message] - The initial message from the customer
 * @return {Object} The newly created booking
 */
router.post('/create', async (req, res) => {
    try {
        const { service_id, customer_id, provider_id, initial_message } = req.body;
        
        const booking = await pool.query(
            'INSERT INTO bookings (service_id, customer_id, provider_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [service_id, customer_id, provider_id, 'pending']
        );

        if (initial_message) {
            await pool.query(
                'INSERT INTO messages (booking_id, sender_id, receiver_id, message) VALUES ($1, $2, $3, $4)',
                [booking.rows[0].id, customer_id, provider_id, initial_message]
            );
        }

        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [provider_id, 'New Booking Request', 'You have received a new booking request', 'booking']
        );

        res.json(booking.rows[0]);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Update the status of a booking.
 * @param {number} req.params.id - The ID of the booking
 * @param {Object} req.body - The request body
 * @param {string} req.body.status - The new status of the booking
 * @return {Object} The updated booking
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );

        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [booking.rows[0].customer_id, 'Booking Update', `Your booking has been ${status}`, 'booking_update']
        );

        res.json(booking.rows[0]);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all bookings for a given user.
 * @param {number} req.params.id - The ID of the user
 * @return {Array} An array of bookings
 */
router.get('/user/:id', async (req, res) => {
    try {
        const bookings = await pool.query(`
            SELECT b.*, s.name as service_name, s.image as service_image,
            u1.name as customer_name, u2.name as provider_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u1 ON b.customer_id = u1.id
            JOIN users u2 ON b.provider_id = u2.id
            WHERE b.customer_id = $1 OR b.provider_id = $1
            ORDER BY b.created_at DESC
        `, [req.params.id]);
        res.json(bookings.rows);
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

