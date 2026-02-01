const express = require('express');
const router = express.Router();
const auth = require('../modules/authMiddleware');
const authorize = require('../modules/authorize');
const { listAnnouncements, createAnnouncement } = require('../controllers/announcementsController');

router.get('/list', listAnnouncements);
router.post('/create', auth, createAnnouncement);

module.exports = router;
