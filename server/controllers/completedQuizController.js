// controllers/completedQuizController.js
const CompletedQuiz = require('../models/CompletedQuiz');

// Get all completed quizzes for the current user
exports.getCompletedQuizByTitle = async (req, res) => {
  try {
    const encodedTitle = req.params.title;
    const title = decodeURIComponent(encodedTitle);

    // Ensure the user is authenticated
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
    }

    // Find the completed quiz by user ID and title
    const completedQuiz = await CompletedQuiz.findOne({ 
      userId: userId,
      quizTitle: title // Ensure this matches how it's stored in MongoDB
    });

    if (!completedQuiz) {
      return res.status(404).json({ message: 'Completed quiz not found' });
    }

    res.json({
      score: completedQuiz.score || 0,
      correctAnswers: completedQuiz.correctAnswers || 0,
      totalQuestions: completedQuiz.totalQuestions || 0,
      detailedResults: completedQuiz.detailedResults || [],
      completedAt: completedQuiz.completedAt || null,
      tabSwitchingDetected: completedQuiz.tabSwitchingDetected || false
    });

  } catch (err) {
    console.error("Error fetching completed quiz:", err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


// Get a specific completed quiz by title
exports.getCompletedQuizByTitle = async (req, res) => {
  try {
    const encodedTitle = req.params.title;
    const title = decodeURIComponent(encodedTitle);
    
    const completedQuiz = await CompletedQuiz.findOne({ 
      userId: req.user?._id,
      quizTitle: title
    });
    
    if (!completedQuiz) {
      return res.status(404).json({ message: 'Completed quiz not found' });
    }
    
    res.json({
      score: completedQuiz.score,
      correctAnswers: completedQuiz.correctAnswers,
      totalQuestions: completedQuiz.totalQuestions,
      detailedResults: completedQuiz.detailedResults,
      completedAt: completedQuiz.completedAt
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Save a completed quiz
exports.saveCompletedQuiz = async (req, res) => {
  try {
    const {
      quizTitle,
      score,
      correctAnswers,
      totalQuestions,
      detailedResults,
      studentAnswers,
      tabSwitchingDetected = false
    } = req.body;

    let completedQuiz = await CompletedQuiz.findOne({
      userId: req.user?._id,
      quizTitle
    });

    if (completedQuiz) {
      completedQuiz.score = score;
      completedQuiz.correctAnswers = correctAnswers;
      completedQuiz.totalQuestions = totalQuestions;
      completedQuiz.detailedResults = detailedResults;
      completedQuiz.studentAnswers = studentAnswers || [];
      completedQuiz.tabSwitchingDetected = tabSwitchingDetected;
      completedQuiz.completedAt = Date.now();
      await completedQuiz.save();
    } else {
      completedQuiz = new CompletedQuiz({
        userId: req.user?._id,
        quizTitle,
        score,
        correctAnswers,
        totalQuestions,
        detailedResults,
        studentAnswers: studentAnswers || [],
        tabSwitchingDetected,
        completedAt: Date.now()
      });
      await completedQuiz.save();
    }

    res.json({
      success: true,
      message: 'Quiz results saved successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
