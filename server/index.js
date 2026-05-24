const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const peopleRoutes = require('./routes/people');
const notifRoutes = require('./routes/notifications');
const groupRoutes = require('./routes/groups');
const { initSocket } = require('./socket/socketManager');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/groups', groupRoutes);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
initSocket(io);

app.set('io', io);

app.use(errorHandler);

connectDB().then(() => {
  server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});