const router = require('express').Router();
const { getNotifications, respond } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/respond', protect, respond);

module.exports = router;