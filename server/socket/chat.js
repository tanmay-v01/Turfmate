const chatRepo = require('../repositories/chat');
const jwtService = require('../services/jwtService');

function registerChatSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    const decoded = jwtService.verify(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', async (data, callback) => {
      try {
        const { roomId, userId, userName, text, type = 'TEXT' } = data;
        if (!roomId || !userId || !text) {
          if (callback) callback({ error: 'roomId, userId, and text are required' });
          return;
        }
        const message = await chatRepo.saveUserMessage({
          roomId,
          userId,
          userName: userName || 'Player',
          text,
          type,
        });
        const payload = { ...message, roomId };
        io.to(roomId).emit('receive_message', payload);
        if (callback) callback({ success: true, message: payload });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('typing', { roomId, userName });
    });

    socket.on('stop_typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('stop_typing', { roomId, userName });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { registerChatSocket };
