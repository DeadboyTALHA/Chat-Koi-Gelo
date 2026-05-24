const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');  // ADD THIS LINE
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

    // ── SEND DM ── (UPDATED)
    socket.on('send_dm', async ({ toUserId, content }) => {
      try {
        // Get sender's username
        const sender = await User.findById(userId).select('username fullName');
        
        const message = {
          from: userId,
          fromUsername: sender.username,
          fromFullName: sender.fullName,
          content,
          timestamp: new Date().toISOString(),
        };
        addDMMessage(userId, toUserId, message);
        const roomId = getDMRoomId(userId, toUserId);
        // Deliver to both participants
        io.to(userId).to(toUserId).emit('receive_dm', { roomId, message });
      } catch (err) {
        console.error('Error sending DM:', err);
      }
    });

    // ── REQUEST DM HISTORY ── (UPDATED)
    socket.on('get_dm_history', async ({ withUserId }) => {
      const messages = getDMMessages(userId, withUserId);
      
      // Enrich messages with usernames
      const enrichedMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.fromUsername) return msg;
        try {
          const sender = await User.findById(msg.from).select('username fullName');
          return {
            ...msg,
            fromUsername: sender?.username || msg.from,
            fromFullName: sender?.fullName || msg.from
          };
        } catch (err) {
          return msg;
        }
      }));
      
      socket.emit('dm_history', { withUserId, messages: enrichedMessages });
    });

    // ── SEND GROUP MESSAGE ── (UPDATED - optional, for group chat usernames)
    socket.on('send_group_msg', async ({ groupId, content }) => {
      try {
        // Get sender's username
        const sender = await User.findById(userId).select('username fullName');
        
        const message = {
          from: userId,
          fromUsername: sender.username,
          fromFullName: sender.fullName,
          content,
          timestamp: new Date().toISOString(),
        };
        addGroupMessage(groupId, message);
        io.to('group:' + groupId).emit('receive_group_msg', { groupId, message });
      } catch (err) {
        console.error('Error sending group message:', err);
      }
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