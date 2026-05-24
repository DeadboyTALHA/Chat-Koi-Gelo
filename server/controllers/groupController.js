const Group = require('../models/Group');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;
    // memberIds are already-connected user IDs
    const group = await Group.create({
      name,
      admin: req.user._id,
      members: [req.user._id, ...memberIds],
    });
    await group.populate('members', 'fullName username');
    // Notify all members via socket
    group.members.forEach(m => {
      req.app.get('io').to(m._id.toString()).emit('added_to_group', {
        groupId: group._id,
        groupName: group.name,
      });
    });
    res.status(201).json(group);
  } catch (err) { next(err); }
};

exports.getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'fullName username')
      .sort('-createdAt');
    res.json(groups);
  } catch (err) { next(err); }
};