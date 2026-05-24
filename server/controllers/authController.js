const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ── REGISTER ──
exports.register = async (req, res, next) => {
  try {
    let { fullName, username, phone, email, password, confirmPassword } = req.body;
    
    // Convert username to lowercase
    username = username.toLowerCase();

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Username must NOT contain any word from fullName
    const nameParts = fullName.toLowerCase().split(/\s+/);
    const lowerUsername = username;
    for (const part of nameParts) {
      if (part && lowerUsername.includes(part)) {
        return res.status(400).json({
          message: 'Username cannot contain any part of your full name',
        });
      }
    }

    const exists = await User.findOne({ $or: [{ email }, { username: lowerUsername }, { phone }] });
    if (exists) {
      return res.status(400).json({ message: 'Credentials already in use' });
    }

    const user = await User.create({ fullName, username: lowerUsername, phone, email, password });
    const token = signToken(user._id);
    res.cookie('token', token, cookieOpts);
    res.status(201).json({ _id: user._id, fullName: user.fullName, username: user.username });
  } catch (err) { 
    next(err); 
  }
};

// ── LOGIN ── (UPDATED - handles lowercase username)
exports.login = async (req, res, next) => {
  try {
    let { identifier, password } = req.body;
    
    // Check if identifier is email (contains @), phone (only numbers), or username
    const isEmail = identifier.includes('@');
    const isPhone = /^\d+$/.test(identifier);
    
    let searchQuery = {};
    if (isEmail) {
      searchQuery = { email: identifier.toLowerCase() };
    } else if (isPhone) {
      searchQuery = { phone: identifier };
    } else {
      // Username - convert to lowercase
      searchQuery = { username: identifier.toLowerCase() };
    }
    
    const user = await User.findOne(searchQuery);
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.cookie('token', token, cookieOpts);
    res.json({ _id: user._id, fullName: user.fullName, username: user.username });
  } catch (err) { 
    next(err); 
  }
};

// ── LOGOUT ──
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

// ── ME ──
exports.getMe = (req, res) => res.json(req.user);