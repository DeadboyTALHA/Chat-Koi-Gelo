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
    console.log('=== REGISTER ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const { fullName, username, phone, email, password, confirmPassword } = req.body;
    
    console.log('Extracted values:', { fullName, username, phone, email });

    if (password !== confirmPassword) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Username must NOT contain any word from fullName
    const nameParts = fullName.toLowerCase().split(/\s+/);
    const lowerUsername = username.toLowerCase();
    for (const part of nameParts) {
      if (part && lowerUsername.includes(part)) {
        console.log('Username contains name part:', part);
        return res.status(400).json({
          message: 'Username cannot contain any part of your full name',
        });
      }
    }

    console.log('Checking if user exists...');
    const exists = await User.findOne({ $or: [{ email }, { username: lowerUsername }, { phone }] });
    if (exists) {
      console.log('User already exists');
      return res.status(400).json({ message: 'Credentials already in use' });
    }

    console.log('Creating user...');
    const user = await User.create({ fullName, username: lowerUsername, phone, email, password });
    console.log('User created:', user._id);
    
    const token = signToken(user._id);
    res.cookie('token', token, cookieOpts);
    res.status(201).json({ _id: user._id, fullName: user.fullName, username: user.username });
  } catch (err) { 
    console.error('REGISTRATION ERROR DETAILS:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    next(err); 
  }
};

// ── LOGIN ──
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    // identifier = username OR email OR phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
    });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.cookie('token', token, cookieOpts);
    res.json({ _id: user._id, fullName: user.fullName, username: user.username });
  } catch (err) { next(err); }
};

// ── LOGOUT ──
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

// ── ME ──
exports.getMe = (req, res) => res.json(req.user);