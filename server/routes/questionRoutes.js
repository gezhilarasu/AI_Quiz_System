// server/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { saveQuestions, updateQuestion,getAllQuizTitles,getQuizByTitle, getAllQuizTitlesForStudent,getQuizByTitleforstudent} = require('../controllers/questionController');

router.post('/', verifyToken, saveQuestions); // To save new questions (initially generated)
router.put('/:id', verifyToken, updateQuestion); // To update an existing question
router.get('/titles', verifyToken, getAllQuizTitles); // To get all quiz titles
router.get('/titles/student', verifyToken, getAllQuizTitlesForStudent); // To get all quiz titles for students
router.get('/quiz/student/:title', verifyToken, getQuizByTitleforstudent); // To get all questions by quiz title
router.get('/quiz/:title', verifyToken, getQuizByTitle); // To get all questions by quiz title

module.exports = router;



