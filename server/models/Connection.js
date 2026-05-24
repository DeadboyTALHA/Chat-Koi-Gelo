const mongoose = require('mongoose');

// Represents a confirmed friendship/connection between two users
const connectionSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  // users always has exactly 2 entries
}, { timestamps: true });

module.exports = mongoose.model('Connection', connectionSchema);