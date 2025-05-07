const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Route imports
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const questionRoutes = require('./routes/questionRoutes'); // ✅ Added question routes
const quizRoutes = require('./routes/QuizRoutes'); // ✅ Added quiz routes

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// ✅ Updated CORS config to allow Vite frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// ✅ Setup session with MongoStore to avoid req.session.touch error
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // 1 day
    })
}));


// ✅ MongoDB connection (cleaned)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/questions', questionRoutes); // ✅ Added question routes

app.use('/api/completedQuizzes',quizRoutes); // ✅ Added completed quiz routes

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
