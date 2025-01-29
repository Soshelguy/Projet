// Summary:
// - Improved code structure by organizing imports and constants.
// - Removed unnecessary imports and code.
// - Enhanced error handling and logging for better debugging.
// - Added comments for functions, parameters, and tricky sections for better readability.
// - Used consistent naming conventions and formatting.

// Required imports
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { generateToken, SECRET_KEY } = require('../utils/token');

// Constants and configuration
const SALT_ROUNDS = 10;

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'djxbwqkz3',
  api_key: '128715672197751',
  api_secret: 'jAmEzO6ck6F7Gl33EaNkuqq_IqI'
});

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Configure multer with CloudinaryStorage
const upload = multer({ storage: storage });

// Database pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'delivprojdb',
  password: process.env.DB_PASSWORD || '2OO4',
  port: process.env.DB_PORT || 5432,
});

// Initialize database tables if they don't exist
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initDb();

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = { userId: user.userId };
    next();
  });
};

// Register new user
router.post('/users/register', upload.single('profileImage'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { email, password, fullName, phone, address } = req.body;
    let profileImageUrl = req.file ? req.file.path : null;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        message: 'Missing required fields',
        received: { email, fullName, phone, address }
      });
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'User already exists. Please login instead.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO users 
      (email, password, full_name, phone, address, profile_image_url) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [email, hashedPassword, fullName, phone, address, profileImageUrl]
    );

    const userId = userResult.rows[0].id;

    await client.query('COMMIT');

    // Generate JWT token
    const token = await generateToken(pool, userResult.rows[0].id, userResult.rows[0].email);

    const userData = {
      id: userId,
      email: userResult.rows[0].email,
      fullName: userResult.rows[0].full_name,
      phone: userResult.rows[0].phone,
      address: userResult.rows[0].address,
      profileImageUrl: profileImageUrl,
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userData,
      authToken: token,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Update user profile
router.put('/users/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  const client = await pool.connect();
  console.log('Fetching profile for user ID:', req.user.userId);

  try {
    await client.query('BEGIN');

    const userId = req.user.userId;
    const { fullName, phone, address } = req.body;

    // Validate input
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    let profileImageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profiles',
        resource_type: 'image'
      });
      profileImageUrl = result.secure_url;
    }

    // Update user's information
    const updateUserQuery = `
      UPDATE users 
      SET 
        full_name = $1, 
        phone = $2, 
        address = $3,
        profile_image_url = COALESCE($4, profile_image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const userUpdateResult = await client.query(updateUserQuery, [
      fullName,
      phone || null,
      address || null,
      profileImageUrl,
      userId
    ]);

    await client.query('COMMIT');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userId,
        fullName: userUpdateResult.rows[0].full_name,
        phone: userUpdateResult.rows[0].phone,
        address: userUpdateResult.rows[0].address,
        profileImageUrl: userUpdateResult.rows[0].profile_image_url,
      },
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Fetch user profile
router.get('/users/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.address,
        u.profile_image_url,
        u.service_provider_request, 
        u.deliverer_request, 
        u.catering_business_request,
        array_agg(r.name) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY 
        u.id, 
        u.email,
        u.full_name,
        u.phone,
        u.address,
        u.profile_image_url,
        u.service_provider_request, 
        u.deliverer_request, 
        u.catering_business_request
    `;
    const result = await pool.query(userQuery, [userId]);

    console.log('Profile Data:', result.rows[0]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign role to user
router.post('/assign-role', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { roleName } = req.body;

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Find the role ID
      const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        [roleName]
      );

      if (roleResult.rowCount === 0) {
        throw new Error('Role not found');
      }

      const roleId = roleResult.rows[0].id;

      // Insert user role
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, roleId]
      );

      // Update corresponding request status
      let updateQuery, updateParams;
      switch (roleName) {
        case 'SERVICE_PROVIDER':
          updateQuery = 'UPDATE users SET service_provider_request = $1 WHERE id = $2';
          updateParams = ['APPROVED', userId];
          break;
        case 'DELIVERER':
          updateQuery = 'UPDATE users SET deliverer_request = $1 WHERE id = $2';
          updateParams = ['APPROVED', userId];
          break;
        case 'CATERING_BUSINESS':
          updateQuery = 'UPDATE users SET catering_business_request = $1 WHERE id = $2';
          updateParams = ['APPROVED', userId];
          break;
        default:
          throw new Error('Invalid role');
      }

      await client.query(updateQuery, updateParams);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Assigned role: ${roleName}`
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Role assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
