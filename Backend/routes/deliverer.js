/**
 * This file contains routes for handling deliverer applications.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * This route is used to submit a deliverer application.
 *
 * @param {Object} req.body - The request body should contain a userId property.
 * @returns {Object} - The response object should contain a success property and a message property.
 */
router.post('/become-deliverer', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    try {
        /**
         * This query updates the user with the given userId to have a request of true.
         * It then returns the updated user.
         */
        const query = 'UPDATE users SET request = true WHERE id = $1 RETURNING *';
        const values = [userId];
        const result = await pool.query(query, values);

        if (result.rowCount === 1) {
            return res.json({ success: true, message: "Application submitted" });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Error updating user request:", error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

module.exports = router;

