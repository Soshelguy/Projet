const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { generateToken, SECRET_KEY } = require('../utils/token');

const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'delivprojdb', 
    password: '2OO4',
    port: 5432, 
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ error: 'No token provided' });
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = { userId: user.userId }; // <--- Change this line
      next();
    });
  };

// Token Generation Route
/*router.post('/generate-token', async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }

        // Verify user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1 AND email = $2', [userId, email]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate token
        const token = jwt.sign(
            { userId, email }, 
            SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json({ error: 'Server error during token generation' });
    }
});*/

// Token Validation Route
router.post('/validate-token', authenticateToken, (req, res) => {
    // If the middleware passes, the token is valid
    res.json({ 
        valid: true, 
        userId: req.user.userId,
        email: req.user.email 
    });
});

router.post('/signup', async (req, res) => {
    const { email, password, name = '', address = '', phone_number = '' } = req.body;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO users (email, password, profile_image_url) VALUES ($1, $2, $3) RETURNING id, email, profile_image_url',
            [email, hashedPassword, profileImageUrl]
        );

        await client.query(
            `INSERT INTO user_profiles (user_id, full_name, phone, address)
             VALUES ($1, $2, $3, $4)`,
            [userResult.rows[0].id, name, phone_number, address]
        );

        await client.query('COMMIT');

        // Generate token immediately after signup
        const token = await generateToken(pool, userResult.rows[0].id, userResult.rows[0].email);

        res.status(201).json({
            message: 'dummy created successfully',
            user: {
                id: userResult.rows[0].id,
                email: userResult.rows[0].email
            },
            authToken: token
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;