const Notification = require('../models/Notification');
const Connection = require('../models/Connection');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'fullName username')
      .sort('-createdAt');
    res.json(notifs);
  } catch (err) { next(err); }
};

exports.respond = async (req, res, next) => {
  try {
    const { notifId, action } = req.body; // action: 'accept' | 'reject'
    const notif = await Notification.findById(notifId).populate('from');
    if (!notif || notif.to.toString() !== req.user._id.toString())
      return res.status(404).json({ message: 'Notification not found' });

    notif.status = action === 'accept' ? 'accepted' : 'rejected';
    await notif.save();

    if (action === 'accept') {
      await Connection.create({ users: [req.user._id, notif.from._id] });
      // Notify the requester
      req.app.get('io').to(notif.from._id.toString()).emit('request_accepted', {
        by: req.user.username,
      });
    }
    res.json({ message: `Request ${action}ed` });
  } catch (err) { next(err); }
};