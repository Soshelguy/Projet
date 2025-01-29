/**
 * This file contains routes for handling deliverer applications.
 * A deliverer application can be submitted by a user, and can be approved or rejected by an admin.
 * The routes in this file are designed to be used by the frontend to interact with the backend.
 * They are not meant to be used directly by users.
 */
const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * This route handles a deliverer application submission from the frontend.
 * It takes a userId from the request body and checks if the user has already submitted an application.
 * If the user has not submitted an application, it sets the user's deliverer_application_status to 'PENDING'.
 * It then returns a success message if the update was successful, or an error message if the user was not found.
 */
router.post('/apply', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Received userId:", userId);

        // Check if the user has already submitted an application
        const checkQuery = `SELECT deliverer_application_status FROM users WHERE id = $1`;
        const checkResult = await pool.query(checkQuery, [userId]);
        console.log("User check result:", checkResult.rows);

        if (!checkResult.rows[0]) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the user has already submitted an application
        if (checkResult.rows[0].deliverer_application_status) {
            return res.status(400).json({ success: false, message: 'You already have an application' });
        }

        // Update the user's deliverer_application_status to 'PENDING'
        const updateQuery = `UPDATE users SET deliverer_application_status = 'PENDING' WHERE id = $1 RETURNING id`;
        const updateResult = await pool.query(updateQuery, [userId]);
        console.log("Update result:", updateResult.rows);

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error in deliverer application:', error);
        res.status(500).json({ success: false, message: 'Server error while processing application' });
    }
});

/**
 * This route handles a deliverer application approval from the frontend.
 * It takes a userId from the request params and an adminId from the request body.
 * It checks if the admin is an actual admin, and if the user has a pending deliverer application.
 * If the checks pass, it sets the user's deliverer_application_status to 'APPROVED' and their role to 'DELIVERER'.
 * It then returns a success message if the update was successful, or an error message if the user was not found.
 */
router.post('/approve/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { adminId } = req.body;  

        // Check if the admin is an actual admin
        const adminCheck = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [adminId]
        );

        if (!adminCheck.rows[0] || adminCheck.rows[0].role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if the user has a pending deliverer application
        const updateQuery = `
            UPDATE users 
            SET 
                deliverer_application_status = 'APPROVED',
                role = 'DELIVERER'
            WHERE id = $1 AND deliverer_application_status = 'PENDING'
            RETURNING id
        `;
        
        const result = await pool.query(updateQuery, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No pending application found'
            });
        }

        res.json({
            success: true,
            message: 'Deliverer application approved'
        });
    } catch (error) {
        console.error('Error in approving deliverer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving application'
        });
    }
});

module.exports = router;
