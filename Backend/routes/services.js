const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const pool = require('../db'); 
const authenticateUser = require('../middleware/auth');
const jwt = require('jsonwebtoken'); 
const { SECRET_KEY } = require('../utils/token');

cloudinary.config({ 
    cloud_name: 'djxbwqkz3', 
    api_key: '128715672197751', 
    api_secret: 'jAmEzO6ck6F7Gl33EaNkuqq_IqI' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'services',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = { id: decoded.userId }; // Ensure 'id' is set correctly
    next();
  });
};

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Access 'req.user.id' instead of 'req.user.userId'

    const servicesResult = await pool.query(
      'SELECT * FROM services WHERE user_id = $1',
      [userId]
    );

    res.json(servicesResult.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

router.post('/', upload.single('image'), authenticateUser, async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const userCheck = await pool.query(
      'SELECT service_provider_request, full_name, phone FROM users WHERE id = $1',
      [req.user.id]
    );
    console.log('User Check:', userCheck.rows[0]);
    const providerFullName = userCheck.rows[0].full_name;
    const providerPhone = userCheck.rows[0].phone;

    const {
      name,
      description,
      price,
      category,
      subcategory,
      subsubcategory,
      userId
    } = req.body;

    console.log('Extracted from req.body:', {
      name,
      description,
      price,
      category,
      subcategory,
      subsubcategory,
      userId
    });

    const imageUrl = req.file ? req.file.path : null;
    const parsedUserId = parseInt(userId, 10);

    // Additional check for undefined variables
    if (
      subcategory === undefined ||
      subsubcategory === undefined ||
      providerFullName === undefined ||
      providerPhone === undefined
    ) {
      console.error('Undefined variables detected:', {
        subcategory,
        subsubcategory,
        providerFullName,
        providerPhone
      });
    }

    // Check for missing fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !subcategory ||
      !subsubcategory ||
      !parsedUserId
    ) {
      return res.status(400).json({
        error: 'All fields are required',
        missing: {
          name: !name,
          description: !description,
          price: !price,
          category: !category,
          subcategory: !subcategory,
          subsubcategory: !subsubcategory,
          userId: !parsedUserId
        }
      });
    }

    console.log('Attempting to insert with values:', {
      name,
      description,
      price,
      category,
      subcategory,
      subsubcategory,
      imageUrl,
      userId: parsedUserId,
      providerFullName,
      providerPhone
    });

    const result = await pool.query(
      `INSERT INTO services 
       (name, description, price, category, subcategory, subsubcategory, image, user_id, provider_full_name, provider_phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        name,
        description,
        price,
        category,
        subcategory,
        subsubcategory,
        imageUrl,
        parsedUserId,
        providerFullName,
        providerPhone
      ]
    );

    console.log('Insert successful, returned row:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({
      error: 'Failed to create service',
      details: error.message
    });
  }
});
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    let query = 'UPDATE services SET ';
    const values = [];
    const updateFields = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (price) {
      updateFields.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }
    if (category) {
      updateFields.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    if (imageUrl) {
      updateFields.push(`image = $${paramCount}`);
      values.push(imageUrl);
      paramCount++;
    }

    query += updateFields.join(', ');
    query += ` WHERE id = $${paramCount} RETURNING *`;

    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (result.rows[0].image) {
      const publicId = result.rows[0].image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});
// In your backend services route
router.get('/', async (req, res) => {
  const { category, subcategory, subsubcategory } = req.query;

  try {
    let query = 'SELECT * FROM services WHERE 1=1';
    const queryParams = [];

    if (category) {
      queryParams.push(category);
      query += ` AND category = $${queryParams.length}`;
    }

    if (subcategory) {
      queryParams.push(subcategory);
      query += ` AND subcategory = $${queryParams.length}`;
    }

    if (subsubcategory) {
      queryParams.push(subsubcategory);
      query += ` AND subsubcategory = $${queryParams.length}`;
    }

    const servicesResult = await pool.query(query, queryParams);
    res.json(servicesResult.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const result = await pool.query(
      'SELECT * FROM services WHERE name ILIKE $1 OR description ILIKE $1',
      [`%${query}%`]

    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ error: 'Failed to search services' });
  }
});

router.get('/:serviceId/reviews', async (req, res) => {
  try {
      const { serviceId } = req.params;
      const result = await pool.query(`
          SELECT 
              r.id,
              r.rating,
              r.feedback,
              r.created_at,
              u.name as reviewer_name,
              u.avatar as reviewer_avatar
          FROM ratings r
          JOIN users u ON r.user_id = u.id
          WHERE r.service_id = $1
          ORDER BY r.created_at DESC
      `, [serviceId]);
      
      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/bookings', authenticateUser, async (req, res) => {
  try {
      const { serviceId, message } = req.body;
      const customerId = req.user.id; 

      const serviceResult = await pool.query(
          'SELECT user_id FROM services WHERE id = $1',
          [serviceId]
      );

      if (serviceResult.rows.length === 0) {
          return res.status(404).json({ error: 'Service not found' });
      }

      const providerId = serviceResult.rows[0].user_id;

      const client = await pool.connect();
      try {
          await client.query('BEGIN');

          const bookingResult = await client.query(
              `INSERT INTO bookings (service_id, customer_id, provider_id, initial_message)
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [serviceId, customerId, providerId, message]
          );

          await client.query(
              `INSERT INTO chat_rooms (booking_id, customer_id, provider_id)
               VALUES ($1, $2, $3)`,
              [bookingResult.rows[0].id, customerId, providerId]
          );

          await client.query(
              `INSERT INTO notifications (user_id, title, message, type, related_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [providerId, 'New Booking Request', 
               'You have received a new booking request',
               'booking', bookingResult.rows[0].id]
          );

          await client.query('COMMIT');
          res.status(201).json({ id: bookingResult.rows[0].id });
      } catch (error) {
          await client.query('ROLLBACK');
          throw error;
      } finally {
          client.release();
      }
  } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/bookings/user', authenticateUser, async (req, res) => {
  try {
      const userId = req.user.id;
      const result = await pool.query(
          `SELECT b.*, s.name as service_name, s.image as service_image,
                  u1.name as customer_name, u2.name as provider_name
           FROM bookings b
           JOIN services s ON b.service_id = s.id
           JOIN users u1 ON b.customer_id = u1.id
           JOIN users u2 ON b.provider_id = u2.id
           WHERE b.customer_id = $1 OR b.provider_id = $1
           ORDER BY b.created_at DESC`,
          [userId]
      );
      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/messages', authenticateUser, async (req, res) => {
  try {
      const { chatRoomId, content } = req.body;
      const senderId = req.user.id;

      const roomCheck = await pool.query(
          `SELECT * FROM chat_rooms 
           WHERE id = $1 AND (customer_id = $2 OR provider_id = $2)`,
          [chatRoomId, senderId]
      );

      if (roomCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Not authorized' });
      }

      const result = await pool.query(
          `INSERT INTO messages (chat_room_id, sender_id, content)
           VALUES ($1, $2, $3) RETURNING *`,
          [chatRoomId, senderId, content]
      );

      const recipientId = roomCheck.rows[0].customer_id === senderId
          ? roomCheck.rows[0].provider_id
          : roomCheck.rows[0].customer_id;

      await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, related_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [recipientId, 'New Message', 'You have received a new message',
           'message', chatRoomId]
      );

      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/messages/:chatRoomId', authenticateUser, async (req, res) => {
  try {
      const { chatRoomId } = req.params;
      const userId = req.user.id;

      const roomCheck = await pool.query(
          `SELECT * FROM chat_rooms 
           WHERE id = $1 AND (customer_id = $2 OR provider_id = $2)`,
          [chatRoomId, userId]
      );

      if (roomCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Not authorized' });
      }

      const result = await pool.query(
          `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
           FROM messages m
           JOIN users u ON m.sender_id = u.id
           WHERE m.chat_room_id = $1
           ORDER BY m.created_at ASC`,
          [chatRoomId]
      );

      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/ratings', authenticateUser, async (req, res) => {
  try {
      const { serviceId, rating, feedback } = req.body;
      const userId = req.user.id;

      const client = await pool.connect();
      try {
          await client.query('BEGIN');

          const existingRating = await client.query(
              'SELECT id FROM ratings WHERE service_id = $1 AND user_id = $2',
              [serviceId, userId]
          );

          if (existingRating.rows.length > 0) {
              return res.status(400).json({ error: 'You have already rated this service' });
          }

          await client.query(
              `INSERT INTO ratings (service_id, user_id, rating, feedback)
               VALUES ($1, $2, $3, $4)`,
              [serviceId, userId, rating, feedback]
          );

          await client.query(
              `UPDATE services 
               SET average_rating = (
                   SELECT AVG(rating) FROM ratings WHERE service_id = $1
               ),
               total_ratings = (
                   SELECT COUNT(*) FROM ratings WHERE service_id = $1
               )
               WHERE id = $1`,
              [serviceId]
          );

          await client.query('COMMIT');
          res.status(201).json({ message: 'Rating submitted successfully' });
      } catch (error) {
          await client.query('ROLLBACK');
          throw error;
      } finally {
          client.release();
      }
  } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ error: 'Failed to submit rating' });
  }
});

router.get('/notifications', authenticateUser, async (req, res) => {
  try {
      const userId = req.user.id;
      const result = await pool.query(
          `SELECT * FROM notifications 
           WHERE user_id = $1 
           ORDER BY created_at DESC`,
          [userId]
      );
      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;