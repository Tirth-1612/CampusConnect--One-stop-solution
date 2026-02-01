const express = require('express');
const router = express.Router();
const { signup, login , update} = require('../controllers/usersController');
const auth = require('../modules/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/update',auth ,update)

module.exports = router;
