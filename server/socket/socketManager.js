const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const {
  getDMRoomId, addDMMessage, getDMMessages,
  addGroupMessage, getGroupMessages, flushUserMessages,
} = require('./messageStore');

function initSocket(io) {
  // Attach io to express app so controllers can emit
  // (call app.set('io', io) in index.js — see below)

  // Auth middleware for socket handshake
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Unauthorised'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log('Socket connected:', userId);

    // Join personal room (for notifications, DMs)
    socket.join(userId);

    // ── JOIN GROUP ROOM ──
    socket.on('join_group', (groupId) => {
      socket.join('group:' + groupId);
      // Send existing group messages to this user
      const msgs = getGroupMessages(groupId);
      socket.emit('group_history', { groupId, messages: msgs });
    });

    // ── SEND DM ──
    socket.on('send_dm', ({ toUserId, content }) => {
      const message = {
        from: userId,
        content,
        timestamp: new Date().toISOString(),
      };
      addDMMessage(userId, toUserId, message);
      const roomId = getDMRoomId(userId, toUserId);
      // Deliver to both participants
      io.to(userId).to(toUserId).emit('receive_dm', { roomId, message });
    });

    // ── REQUEST DM HISTORY ──
    socket.on('get_dm_history', ({ withUserId }) => {
      const messages = getDMMessages(userId, withUserId);
      socket.emit('dm_history', { withUserId, messages });
    });

    // ── SEND GROUP MESSAGE ──
    socket.on('send_group_msg', ({ groupId, content }) => {
      const message = {
        from: userId,
        content,
        timestamp: new Date().toISOString(),
      };
      addGroupMessage(groupId, message);
      io.to('group:' + groupId).emit('receive_group_msg', { groupId, message });
    });

    // ── TYPING INDICATORS ──
    socket.on('typing_dm', ({ toUserId }) => {
      socket.to(toUserId).emit('user_typing_dm', { from: userId });
    });
    socket.on('stop_typing_dm', ({ toUserId }) => {
      socket.to(toUserId).emit('user_stop_typing_dm', { from: userId });
    });

    // ── DISCONNECT: flush user messages ──
    socket.on('disconnect', () => {
      console.log('Disconnected:', userId);
      flushUserMessages(userId);
      // Notify all rooms that user went offline
      io.emit('user_offline', { userId });
    });
  });
}

module.exports = { initSocket };