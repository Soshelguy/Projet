const jwt = require('jsonwebtoken');

// Ensure the SECRET_KEY is properly defined
const SECRET_KEY = process.env.SECRET_KEY || '86be29382d9df7bcbffff7933e37f93a916c360c5e92d1fe15bff844689be88bd9539d69c73eba0885612afb830f82f0a523b4bd8ffdd68d61b5813fb405a90c';

const generateToken = async (pool, userId, email) => {
    try {
        console.log('Generating token for user:', userId);
        
        // More robust user verification
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        // Ensure SECRET_KEY is defined
        if (!SECRET_KEY) {
            throw new Error('SECRET_KEY is not defined');
        }

        // Generate token with more information
        const token = jwt.sign(
            { 
                userId, 
                email,
                // You can add more user details if needed
                role: userResult.rows[0].role || 'CLIENT'
            }, 
            SECRET_KEY, 
            { expiresIn: '7d' }  // Extended token expiration
        );

        console.log('Token generated successfully for user:', userId);
        return token;
    } catch (error) {
        console.error('Token generation error:', {
            userId,
            email,
            errorMessage: error.message
        });
        throw error;
    }
};

module.exports = { generateToken, SECRET_KEY };