const express = require('express');
const router = express.Router();
const pool = require('../db'); 


router.post('/become-deliverer', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    try {
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
