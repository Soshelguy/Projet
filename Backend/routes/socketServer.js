const socketIo = require('socket.io');
const pool = require('../db');
const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('joinRoom', ({ roomId }) => {
            console.log('Client joining room:', roomId);
            const room = `booking_${roomId}`;
            socket.join(room);
        });


        socket.on('sendMessage', async ({ roomId, message }) => {
            try {
                console.log('Received message:', message);
                
                const { booking_id, sender_id, receiver_id, text } = message;
        
                // Validate required fields
                if (!booking_id || !sender_id || !receiver_id || !text) {
                    console.error('Missing required fields:', { booking_id, sender_id, receiver_id, text });
                    return;
                }
        
                const result = await pool.query(
                    `INSERT INTO messages 
                    (booking_id, sender_id, receiver_id, text, created_at, read) 
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false) 
                    RETURNING *, 
                    (SELECT full_name FROM users WHERE id = $2) as sender_name`,
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

        socket.on('markAsRead', async ({ roomId, booking_id, user_id }) => {
            try {
                console.log('Marking messages as read:', { booking_id, user_id });
                
                const result = await pool.query(
                    `UPDATE messages 
                     SET read = true 
                     WHERE booking_id = $1 
                     AND receiver_id = $2 
                     AND read = false
                     RETURNING id`,
                    [booking_id, user_id]
                );

                if (result.rows.length > 0) {
                    io.to(`booking_${roomId}`).emit('messagesRead', {
                        booking_id,
                        reader_id: user_id
                    });
                }
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = initializeSocket;