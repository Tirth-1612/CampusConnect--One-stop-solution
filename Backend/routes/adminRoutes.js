import express from 'express';
import auth from '../modules/authMiddleware.js';
import { getUsersCount,createClub } from '../controllers/adminController.js';
const router = express.Router();

// Read-only users count
router.get('/users/count', auth, getUsersCount);
router.get('/api/createclub',auth,createClub)
export default router;
