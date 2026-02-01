const express = require('express');
const router = express.Router();
const auth = require('../modules/authMiddleware');
const { getUsersCount } = require('../controllers/adminController');

// Read-only users count
router.get('/users/count', auth, getUsersCount);

module.exports = router;
