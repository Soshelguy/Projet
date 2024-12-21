const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/apply', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Received userId:", userId);

        const checkQuery = `SELECT deliverer_application_status FROM users WHERE id = $1`;
        const checkResult = await pool.query(checkQuery, [userId]);
        console.log("User check result:", checkResult.rows);

        if (!checkResult.rows[0]) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (checkResult.rows[0].deliverer_application_status) {
            return res.status(400).json({ success: false, message: 'You already have an application' });
        }

        const updateQuery = `UPDATE users SET deliverer_application_status = 'PENDING' WHERE id = $1 RETURNING id`;
        const updateResult = await pool.query(updateQuery, [userId]);
        console.log("Update result:", updateResult.rows);

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error in deliverer application:', error);
        res.status(500).json({ success: false, message: 'Server error while processing application' });
    }
});

router.post('/approve/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { adminId } = req.body;  

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