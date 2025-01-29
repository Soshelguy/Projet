// routes/authRoutes.js
// This file contains endpoints for validating JSON Web Tokens (JWTs) and generating new ones.

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');  // Adjust the path to your database connection
const { generateToken, SECRET_KEY } = require('../utils/token');

// Token validation endpoint
// This endpoint takes in a JWT from the Authorization header and verifies it.
// If the token is valid, it returns a JSON object with a message indicating that the token is valid and the user's ID and email.
router.post('/validate-token', async (req, res) => {
    // Get the JWT from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // If no token is provided, return a 401 error
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token using the SECRET_KEY
        const decoded = jwt.verify(token, SECRET_KEY);
        
        // Use 'userId' for consistency
        // Query the database to get the user associated with the decoded user ID
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        
        // If no user is found, return a 401 error
        if (!user.rows.length) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Return a JSON object with a message indicating that the token is valid and the user's ID and email
        res.json({ 
            message: 'Token is valid', 
            user: { 
                userId: user.rows[0].id,  // Use 'userId' for consistency
                email: user.rows[0].email 
            } 
        });
    } catch (error) {
        // If the token is invalid or expired, return a 401 error
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});



module.exports = router;
