const socketIo = require('socket.io');
const pool = require('../db');

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('joinRoom', ({ roomId }) => {
            console.log('Client joining room:', roomId);
            socket.join(`booking_${roomId}`);
        });

        socket.on('sendMessage', async ({ roomId, message }) => {
            try {
                console.log('Received message:', message);
                console.log('For room:', roomId);

                const { booking_id, sender_id, receiver_id, text } = message;

                // Save message to database
                const result = await pool.query(
                    `INSERT INTO messages 
                    (booking_id, sender_id, receiver_id, text, created_at) 
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
                    RETURNING *`,
                    [booking_id, sender_id, receiver_id, text]
                );

                const savedMessage = result.rows[0];
                console.log('Message saved:', savedMessage);

                // Broadcast to room
                io.to(`booking_${roomId}`).emit('receiveMessage', savedMessage);
            } catch (error) {
                console.error('Socket error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = initializeSocket;