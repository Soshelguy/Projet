const jwt = require('jsonwebtoken');
const SECRET_KEY = '86be29382d9df7bcbffff7933e37f93a916c360c5e92d1fe15bff844689be88bd9539d69c73eba0885612afb830f82f0a523b4bd8ffdd68d61b5813fb405a90c'; // Ensure this matches the key used for signing tokens

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = { id: decoded.userId }; // Use 'userId' as per your token payload
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = authenticateUser;