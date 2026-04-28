const socketIo = require('socket.io');

const onlineUsers = new Map(); // socketId → { userId, userName, projectId }

const initSockets = (server) => {
  const io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], credentials: true },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join a project room ──────────────────────────────────
    socket.on('join:project', ({ projectId, userId, userName }) => {
      socket.join(projectId);
      onlineUsers.set(socket.id, { userId, userName, projectId });

      // Notify others in the room
      socket.to(projectId).emit('user:joined', { userId, userName, timestamp: new Date() });

      // Send current online members to the new joiner
      const roomMembers = [...onlineUsers.values()].filter(u => u.projectId === projectId);
      socket.emit('online:members', roomMembers);

      console.log(`👥 ${userName} joined project room: ${projectId}`);
    });

    // ── Leave a project room ─────────────────────────────────
    socket.on('leave:project', (projectId) => {
      socket.leave(projectId);
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.to(projectId).emit('user:left', { userId: user.userId, userName: user.userName });
      }
    });

    // ── Project Chat ─────────────────────────────────────────
    socket.on('chat:message', (data) => {
      const { projectId } = data;
      // Support both frontend formats: {senderId, senderName, text} and {message, user}
      const payload = {
        sender: data.senderId ? { _id: data.senderId, name: data.senderName } : data.user,
        senderName: data.senderName || data.user?.name || 'Unknown',
        text: data.text || data.message || '',
        createdAt: new Date(),
      };
      io.to(projectId).emit('chat:message', payload);
    });

    // ── Typing Indicator ─────────────────────────────────────
    socket.on('chat:typing', (data) => {
      const { projectId, userName, userId } = data;
      socket.to(projectId).emit('chat:typing', { userName, userId, isTyping: true });
    });

    // ── Notification broadcast ───────────────────────────────
    socket.on('notification:send', ({ projectId, type, message, user }) => {
      io.to(projectId).emit('notification', { type, message, user, timestamp: new Date() });
    });

    // ── Disconnect ───────────────────────────────────────────
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.to(user.projectId).emit('user:left', { userId: user.userId, userName: user.userName });
        onlineUsers.delete(socket.id);
      }
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSockets;
