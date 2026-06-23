const chatRepo = require('../repositories/chat');

function registerChatSocket(io) {
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

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { registerChatSocket };
