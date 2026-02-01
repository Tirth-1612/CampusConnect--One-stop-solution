const express = require('express');
const router = express.Router();
const auth = require('../modules/authMiddleware');
const authorize = require('../modules/authorize');
const { listClubs, listClubsWithStatus, createClub, joinClub, getPendingRequests, updateUserClubStatus, getClubMembers, updateUserClubStatusV2 } = require('../controllers/clubsController');

//get the list of all clubs
router.get('/list', listClubs);

//get the list of all clubs with membership status for the logged in user
router.get('/list-with-status', auth, listClubsWithStatus);

//create a new club, only doable by admin
router.post('/create', auth, authorize(['admin']), createClub);

// User joins a club
router.post('/:clubId/join', auth, joinClub);

// Admin fetches pending requests for a club
router.get('/:clubId/pendingrequests', auth, getPendingRequests);

// Admin approves or rejects a request
router.patch('/:clubId/users/:userId', auth, updateUserClubStatus);

// List approved club members
router.get('/:clubId/members', auth, getClubMembers);

// New: Update status with explicit endpoint and return updated row
router.patch('/:clubId/users/:userId/status', auth, updateUserClubStatusV2);

module.exports = router;
