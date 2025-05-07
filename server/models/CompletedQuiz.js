const mongoose = require('mongoose');

const detailedResultSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String]
  },
  studentAnswer: {
    type: String,
  },
  studentAnswerIndex: {
    type: Number
  },
  studentAnswerLetter: {
    type: String
  },
  correctAnswer: {
    type: String,
  },
  correctAnswerLetter: {
    type: String
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const studentAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOptionIndex: {
    type: Number
  },
  selectedOptionLetter: {
    type: String
  }
});

const completedQuizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizTitle: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  detailedResults: [detailedResultSchema],
  studentAnswers: [studentAnswerSchema],
  tabSwitchingDetected: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index to prevent multiple completions
completedQuizSchema.index({ userId: 1, quizTitle: 1 }, { unique: true });

const CompletedQuiz = mongoose.model('CompletedQuiz', completedQuizSchema);

module.exports = CompletedQuiz;
