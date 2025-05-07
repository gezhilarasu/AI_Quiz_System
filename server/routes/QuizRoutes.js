// routes/completedQuizzes.js
const express = require('express');
const router = express.Router();
const completedQuizController = require('../controllers/completedQuizController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all completed quizzes for the current user
router.get('/', verifyToken, completedQuizController.getCompletedQuizzes);

// Get a specific completed quiz by title
router.get('/completed_quiz/:title', verifyToken, completedQuizController.getCompletedQuizByTitle);

// Save a completed quiz
router.post('/', verifyToken, completedQuizController.saveCompletedQuiz);

module.exports = router;