/**
 * This file contains functions for working with ratings in the database.
 * 
 * The functions are:
 * - add: Adds a new rating to the database.
 * - getRatingsForService: Gets all ratings for a given service.
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Adds a new rating to the database.
 * 
 * Parameters:
 * - service_id: The ID of the service being rated.
 * - user_id: The ID of the user leaving the rating.
 * - rating: The rating given, a number between 1 and 5.
 * - review: The review text, optional.
 * 
 * Returns:
 * - A JSON object with the ID of the new rating.
 */
router.post('/add', async (req, res) => {
    try {
        const { service_id, user_id, rating, feedback } = req.body;
        
        // Check if the user has booked and completed the service
        const bookingCheck = await pool.query(
            'SELECT * FROM bookings WHERE service_id = $1 AND customer_id = $2 AND status = $3',
            [service_id, user_id, 'completed']
        );
        
        if (bookingCheck.rows.length === 0) {
            return res.status(400).json({ message: 'You can only rate services you have booked and completed' });
        }

        // Check if the user has already rated the service
        const existingRating = await pool.query(
            'SELECT * FROM ratings WHERE service_id = $1 AND user_id = $2',
            [service_id, user_id]
        );

        if (existingRating.rows.length > 0) {
            return res.status(400).json({ message: 'You have already rated this service' });
        }

        // Add the new rating to the database
        const newRating = await pool.query(
            'INSERT INTO ratings (service_id, user_id, rating, feedback) VALUES ($1, $2, $3, $4) RETURNING *',
            [service_id, user_id, rating, feedback]
        );

        // Update the average rating and total ratings for the service
        await pool.query(`
            UPDATE services 
            SET average_rating = (
                SELECT AVG(rating) FROM ratings WHERE service_id = $1
            ),
            total_ratings = (
                SELECT COUNT(*) FROM ratings WHERE service_id = $1
            )
            WHERE id = $1
        `, [service_id]);

        // Notify the service provider of the new rating
        const service = await pool.query('SELECT user_id FROM services WHERE id = $1', [service_id]);
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [service.rows[0].user_id, 'New Rating', `Your service received a new ${rating}-star rating`, 'rating']
        );

        // Return the new rating
        res.json(newRating.rows[0]);
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Gets all ratings for a given service.
 * 
 * Parameters:
 * - id: The ID of the service.
 * 
 * Returns:
 * - A JSON object with an array of ratings.
 */
router.get('/service/:id', async (req, res) => {
    try {
        const ratings = await pool.query(`
            SELECT r.*, u.name as user_name 
            FROM ratings r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.service_id = $1 
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        res.json(ratings.rows);
    } catch (error) {
        console.error('Error getting ratings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
