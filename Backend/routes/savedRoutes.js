const express = require('express');
const router = express.Router();
const auth = require('../modules/authMiddleware');
const { saveItem, listSaved, listSavedAnnouncements, listSavedEvents } = require('../controllers/savedController');

// Alias: allow POST /api/saved to save an item
router.post('/', auth, saveItem);
router.post('/saveItem', auth, saveItem);
router.get('/listSavedItem', auth, listSaved);
router.get('/announcements', auth, listSavedAnnouncements);
router.get('/events', auth, listSavedEvents);

module.exports = router;
