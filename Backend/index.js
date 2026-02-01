import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/usersRoutes.js';
import announcementsRoutes from './routes/announcementsRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import clubsRoutes from './routes/clubsRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import './database.js';

const app = express();

// middlewares
app.use(cors({
  origin: [
    /^https:\/\/campusconnect1-.*\.vercel\.app$/,
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/users', authRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRoutes);

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server is operational'));



//user logins with email,pass.
//email pass goes to backend 
//backend verifies it and if everything good returns login token and user info
//frontend stores token
//for evreything else sends that token as authentication header ,i.e bearer <token> which is used in authMiddleware.js
//if auth checks out then loads data for that token

