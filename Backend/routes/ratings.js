const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/add', async (req, res) => {
    try {
        const { service_id, user_id, rating, review } = req.body;
        
        const bookingCheck = await pool.query(
            'SELECT * FROM bookings WHERE service_id = $1 AND customer_id = $2 AND status = $3',
            [service_id, user_id, 'completed']
        );
        
        if (bookingCheck.rows.length === 0) {
            return res.status(400).json({ message: 'You can only rate services you have booked and completed' });
        }

        const existingRating = await pool.query(
            'SELECT * FROM ratings WHERE service_id = $1 AND user_id = $2',
            [service_id, user_id]
        );

        if (existingRating.rows.length > 0) {
            return res.status(400).json({ message: 'You have already rated this service' });
        }

        const newRating = await pool.query(
            'INSERT INTO ratings (service_id, user_id, rating, review) VALUES ($1, $2, $3, $4) RETURNING *',
            [service_id, user_id, rating, review]
        );

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

        const service = await pool.query('SELECT user_id FROM services WHERE id = $1', [service_id]);
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [service.rows[0].user_id, 'New Rating', `Your service received a new ${rating}-star rating`, 'rating']
        );

        res.json(newRating.rows[0]);
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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