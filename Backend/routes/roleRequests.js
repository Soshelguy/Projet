const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// Service Provider Request Route
router.post('/request-service-provider', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    try {
        // Check if user already has a pending or approved service provider request
        const existingRequestQuery = `
            SELECT service_provider_request 
            FROM users 
            WHERE id = $1 AND (service_provider_request = 'PENDING' OR service_provider_request = 'APPROVED')
        `;
        const existingRequestResult = await pool.query(existingRequestQuery, [userId]);

        if (existingRequestResult.rowCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "You already have a pending or approved service provider request" 
            });
        }

        // Update user's service provider request status
        const query = `
            UPDATE users 
            SET service_provider_request = 'PENDING' 
            WHERE id = $1 
            RETURNING *
        `;
        const values = [userId];
        const result = await pool.query(query, values);

        if (result.rowCount === 1) {
            return res.json({ 
                success: true, 
                message: "Service Provider application submitted",
                user: result.rows[0]
            });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Error submitting service provider request:", error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

// Catering Business Request Route
router.post('/request-catering-business', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    try {
        // Check if user already has a pending or approved catering business request
        const existingRequestQuery = `
            SELECT catering_business_request 
            FROM users 
            WHERE id = $1 AND (catering_business_request = 'PENDING' OR catering_business_request = 'APPROVED')
        `;
        const existingRequestResult = await pool.query(existingRequestQuery, [userId]);

        if (existingRequestResult.rowCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "You already have a pending or approved catering business request" 
            });
        }

        // Update user's catering business request status
        const query = `
            UPDATE users 
            SET catering_business_request = 'PENDING' 
            WHERE id = $1 
            RETURNING *
        `;
        const values = [userId];
        const result = await pool.query(query, values);

        if (result.rowCount === 1) {
            return res.json({ 
                success: true, 
                message: "Catering Business application submitted",
                user: result.rows[0]
            });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Error submitting catering business request:", error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

module.exports = router;
