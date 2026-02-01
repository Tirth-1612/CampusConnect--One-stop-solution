const express = require('express');
const router = express.Router();
const auth = require('../modules/authMiddleware');
const { listEvents, createEvent } = require('../controllers/eventsController');

router.get('/list', listEvents);
router.post('/create', auth, createEvent);

module.exports = router;
