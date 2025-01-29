/**
 * This file contains routes for handling notifications.
 * 
 * @module routes/notifications
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * This route gets all notifications for a user.
 * 
 * @param {integer} id The ID of the user to get notifications for.
 * @return {json} A JSON object containing an array of notifications for the user.
 */
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

/**
 * This route marks a notification as read.
 * 
 * @param {integer} id The ID of the notification to mark as read.
 * @return {json} A JSON object with a message indicating that the notification was marked as read.
 */
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
