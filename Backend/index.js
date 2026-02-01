const express = require('express')
const app = express()
require('dotenv').config()
const db = require('./database')
const authRoutes = require('./routes/usersRoutes')
const announcementsRoutes = require('./routes/announcementsRoutes')
const eventsRoutes = require('./routes/eventsRoutes')
const clubsRoutes = require('./routes/clubsRoutes')
const savedRoutes = require('./routes/savedRoutes')
const adminRoutes = require('./routes/adminRoutes')
const cors = require('cors')


//middlewares
app.use(cors({
  origin: ['http://localhost:5173',
            'https://campusconnect1-3rlsb15do-kavishdesai07-3013s-projects.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//routes
app.use('/api/users', authRoutes)
app.use('/api/announcements', announcementsRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/clubs', clubsRoutes)
app.use('/api/saved', savedRoutes)
app.use('/api/admin', adminRoutes)
    
//server
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>console.log('Server is operational'))




//user logins with email,pass.
//email pass goes to backend 
//backend verifies it and if everything good returns login token and user info
//frontend stores token
//for evreything else sends that token as authentication header ,i.e bearer <token> which is used in authMiddleware.js
//if auth checks out then loads data for that token

