// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');
const pool = require('./db'); 
const serviceRoutes = require('./routes/services');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favorite');
const usersRoutes = require('./routes/users');
const delivererRoutes = require('./routes/delivererRoutes');
const roleRequestRoutes = require('./routes/roleRequests');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages'); 
const ratingsRoutes = require('./routes/ratings');
const jwt = require('jsonwebtoken');
const { generateToken, SECRET_KEY } = require('./utils/token');
const path = require('path');
const http = require('http');
const socketServer = require('./routes/socketServer');

const app = express();

// Create HTTP server
const server = http.createServer(app);
// Initialize socket
const io = socketServer(server);
app.set('io', io);

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



pool.connect()
    .then(() => {
        console.log('PostgreSQL connected successfully');
    })
    .catch(err => {
        console.error('PostgreSQL connection error', err);
    });

app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/deliverer', delivererRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', roleRequestRoutes);
app.use('/api', usersRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingsRoutes);

app.post('/signup', async (req, res) => {
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
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            [email, hashedPassword]
        );
        const userId = userResult.rows[0].id;

        const authToken = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '7d' });

        await client.query(
            'UPDATE users SET authToken = $1 WHERE id = $2',
            [authToken, userId]
        );

        await client.query(
            `INSERT INTO user_profiles (user_id, full_name, phone, address)
             VALUES ($1, $2, $3, $4)`,
            [userId, name, phone_number, address]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'User created successfully',
            userId,
            authToken, // Return the token as part of the response
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                u.id, u.email, u.password, 
                u.full_name as name, u.phone as phone_number, 
                u.address, u.profile_image_url
            FROM users u
            WHERE u.email = $1
        `;
        const user = await pool.query(query, [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Ensure user profile exists
        const profileQuery = `
            INSERT INTO user_profiles (user_id, full_name, phone, address, profile_image_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE 
            SET full_name = EXCLUDED.full_name, 
                phone = EXCLUDED.phone, 
                address = EXCLUDED.address,
                profile_image_url = EXCLUDED.profile_image_url
        `;
        await pool.query(profileQuery, [
            user.rows[0].id, 
            user.rows[0].name, 
            user.rows[0].phone_number, 
            user.rows[0].address,
            user.rows[0].profile_image_url
        ]);

        const token = await generateToken(pool, user.rows[0].id, user.rows[0].email);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                name: user.rows[0].name,
                phone_number: user.rows[0].phone_number,
                address: user.rows[0].address,
                profile_image_url: user.rows[0].profile_image_url
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.header('Content-Type', 'application/json');
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message
    });
});

// Add this route for role assignment (admin or system side)
app.post('/admin/assign-role', async (req, res) => {
    const { userId, roleName } = req.body;

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

            // Update request status
            let updateQuery, updateParams;
            switch(roleName) {
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

app.get('/check/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        
        const profileResult = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
        
        res.json({
            userExists: userResult.rows.length > 0,
            profileExists: profileResult.rows.length > 0,
            userData: userResult.rows[0] || null,
            profileData: profileResult.rows[0] || null
        });
    } catch (error) {
        console.error('Diagnostic check error:', error);
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});