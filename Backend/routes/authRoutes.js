// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');  // Adjust the path to your database connection
const { generateToken, SECRET_KEY } = require('../utils/token');


// Token validation endpoint
router.post('/validate-token', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        
        // Use 'userId' for consistency
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        
        if (!user.rows.length) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        res.json({ 
            message: 'Token is valid', 
            user: { 
                userId: user.rows[0].id,  // Use 'userId' for consistency
                email: user.rows[0].email 
            } 
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});


module.exports = router;