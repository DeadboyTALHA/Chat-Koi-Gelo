const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

// Search users by username (exclude self)
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('fullName username').limit(10);
    res.json(users);
  } catch (err) { next(err); }
};

// Send add request
exports.sendRequest = async (req, res, next) => {
  try {
    const { toUserId } = req.body;
    // Check not already connected
    const already = await Connection.findOne({ users: { $all: [req.user._id, toUserId] } });
    if (already) return res.status(400).json({ message: 'Already connected' });
    const pending = await Notification.findOne({ from: req.user._id, to: toUserId, status: 'pending' });
    if (pending) return res.status(400).json({ message: 'Request already sent' });

    const notif = await Notification.create({ from: req.user._id, to: toUserId });
    // Emit to recipient via socket (socketManager will handle this)
    req.app.get('io').to(toUserId.toString()).emit('new_notification', { from: req.user.username });
    res.json({ message: 'Request sent' });
  } catch (err) { next(err); }
};

// Get connected people
exports.getPeople = async (req, res, next) => {
  try {
    const conns = await Connection.find({ users: req.user._id })
      .populate('users', 'fullName username')
      .sort('-createdAt');
    const people = conns.map(c => c.users.find(u => u._id.toString() !== req.user._id.toString()));
    res.json(people);
  } catch (err) { next(err); }
};