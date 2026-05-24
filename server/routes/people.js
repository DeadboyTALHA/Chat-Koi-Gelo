const router = require('express').Router();
const { searchUsers, sendRequest, getPeople } = require('../controllers/peopleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPeople);
router.get('/search', protect, searchUsers);
router.post('/request', protect, sendRequest);

module.exports = router;