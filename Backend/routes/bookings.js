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
/* {
    *   service_id: number,
    *   booking_date: string (YYYY-MM-DD),
    *   booking_time: string, // e.g. "10:00 AM" or "14:30"
    *   message: string
    * }
    */
router.post('/create', authenticateToken, async (req, res) => {
    try {
      const { service_id, booking_date, booking_time } = req.body;
      const customer_id = req.user.userId; // Use userId from the token
  
       // Check if user already has ANY active booking for this service
       const existingBooking = await pool.query(
        `SELECT id FROM bookings 
         WHERE service_id = $1 
         AND customer_id = $2 
         AND status IN ('pending', 'confirmed')`,
        [service_id, customer_id]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ 
          status: 'DUPLICATE_BOOKING',
          message: 'You already have an active booking for this service. Please wait until your current booking is completed.'
      });
  }
      const serviceResult = await pool.query(
        'SELECT user_id FROM services WHERE id = $1',
        [service_id]
      );
  
      if (serviceResult.rows.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      const provider_id = serviceResult.rows[0].user_id;
  
      // Corrected INSERT statement: removed trailing comma, matched columns to placeholders
      const bookingResult = await pool.query(
        `INSERT INTO bookings (
           service_id, 
           customer_id, 
           provider_id, 
           booking_date, 
           booking_time, 
           status
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          service_id,
          customer_id,
          provider_id,
          booking_date,
          booking_time,
          'pending'
        ]
      );
  
      const booking = bookingResult.rows[0];
  
      await pool.query(
        `INSERT INTO chat_rooms (booking_id, customer_id, provider_id)
         VALUES ($1, $2, $3)`,
        [booking.id, customer_id, provider_id]
      );
  
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES ($1, $2, $3, $4, $5)',
        [
            provider_id, 
            'New Booking Request',
            'You have received a new booking request', // Changed to use direct string instead of message column
            'booking',
            booking.id
        ]
    );
  
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });
  router.get('/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const result = await pool.query(
            `SELECT 
                b.*,
                s.name as service_name,
                s.user_id as provider_id,
                u.full_name as customer_name,
                u.id as customer_id
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u ON b.customer_id = u.id
            WHERE b.id = $1`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});
  //Endpoint for booking count
router.get('/service/:serviceId/count', authenticateToken, async (req, res) => {
  try {
      const { serviceId } = req.params;
      
      const serviceCheck = await pool.query(
          'SELECT id FROM services WHERE id = $1',
          [serviceId]
      );

      if (serviceCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Service not found' });
      }

      const result = await pool.query(
          `SELECT COUNT(*) as count
           FROM bookings
           WHERE service_id = $1 
           AND status IN ('pending', 'confirmed')`,
          [serviceId]
      );

      res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
      console.error('Error getting booking count:', error);
      res.status(500).json({ error: 'Failed to get booking count' });
  }
});

  // Update the unavailable slots endpoint to handle errors better
router.get('/unavailable-slots/:serviceId', async (req, res) => {
  try {
      if (!req.params.serviceId) {
          return res.status(400).json({ error: 'Service ID is required' });
      }

      const result = await pool.query(
          `SELECT booking_date::text, booking_time 
           FROM bookings 
           WHERE service_id = $1 
           AND status IN ('pending', 'confirmed')
           AND booking_date >= CURRENT_DATE`,
          [req.params.serviceId]
      );
      
      const unavailableSlots = result.rows.map(row => ({
          date: row.booking_date,
          time: row.booking_time
      }));

      res.json(unavailableSlots);
  } catch (error) {
      console.error('Error getting unavailable slots:', error);
      res.status(500).json({ error: 'Failed to fetch unavailable slots', details: error.message });
  }
});
/**
 * Update the status of a booking.
 * @param {number} req.params.id - The ID of the booking.
 * @property {string} req.body.status - The new status of the booking.
 */
// Update the status update endpoint to include authentication
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await pool.query(
          `UPDATE bookings 
           SET status = $1 
           WHERE id = $2 
           RETURNING *`,
          [status, id]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Failed to update booking status' });
  }
});
  
router.get('/user/bookings', authenticateToken, async (req, res) => {
  try {
      const userId = req.user.userId;
      
      const bookings = await pool.query(
          `SELECT 
              b.*,
              s.name as service_name,
              s.image as service_image,
              u.name as provider_name,
              (
                  SELECT COUNT(*)
                  FROM messages m
                  WHERE m.booking_id = b.id
                  AND m.receiver_id = $1
                  AND m.read = false
              ) as unread_messages
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN users u ON b.provider_id = u.id
          WHERE b.customer_id = $1
          ORDER BY b.booking_date DESC, b.booking_time DESC`,
          [userId]
      );

      res.json(bookings.rows);
  } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
  
/**
 * Get all bookings for a given user.
 * @param {number} req.params.id - The ID of the user.
 * Returns an array of bookings (including service and user info).
 */
router.get('/user/:id', async (req, res) => {
    try {
      const bookings = await pool.query(
        `
        SELECT b.*, s.name as service_name, s.image as service_image,
               u1.name as customer_name, u2.name as provider_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u1 ON b.customer_id = u1.id
        JOIN users u2 ON b.provider_id = u2.id
        WHERE b.customer_id = $1 OR b.provider_id = $1
        ORDER BY b.created_at DESC
        `,
        [req.params.id]
      );
  
      res.json(bookings.rows);
    } catch (error) {
      console.error('Error getting bookings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
   // service bookings endpoint
router.get('/service/:serviceId', authenticateToken, async (req, res) => {
  try {
      const bookings = await pool.query(
          `SELECT 
              b.id,
              b.booking_date,
              b.booking_time,
              b.status,
              b.customer_id,
              u.full_name as customer_name,
              COALESCE(u.profile_image_url, 'https://via.placeholder.com/50') as customer_image,
              (
                  SELECT COUNT(*)
                  FROM messages m
                  WHERE m.booking_id = b.id
                  AND m.receiver_id = $2
                  AND m.read = false
              ) as unread_messages
           FROM bookings b
           JOIN users u ON b.customer_id = u.id
           WHERE b.service_id = $1
           ORDER BY b.booking_date DESC, b.booking_time DESC`,
          [req.params.serviceId, req.user.userId]
      );

      res.json(bookings.rows);
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

  module.exports = router;
