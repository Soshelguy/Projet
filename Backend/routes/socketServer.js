// socketServer.js
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

    socket.on('joinRoom', async (bookingId) => {
      socket.join(`booking_${bookingId}`);
      
      // Fetch previous messages
      try {
        const messages = await pool.query(
          `SELECT * FROM messages 
           WHERE booking_id = $1 
           ORDER BY created_at ASC`,
          [bookingId]
        );
        socket.emit('previousMessages', messages.rows);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    socket.on('sendMessage', async (messageData) => {
      try {
        const { content, senderId, bookingId } = messageData;
        
        // Save message to database
        const result = await pool.query(
          `INSERT INTO messages (content, sender_id, booking_id)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [content, senderId, bookingId]
        );

        // Broadcast message to room
        io.to(`booking_${bookingId}`).emit('message', result.rows[0]);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};