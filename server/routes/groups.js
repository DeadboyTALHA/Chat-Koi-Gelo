const router = require('express').Router();
const { createGroup, getMyGroups } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyGroups);
router.post('/', protect, createGroup);

module.exports = router;