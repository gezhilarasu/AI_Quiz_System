// server/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    teacher_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { 
        type: String,
        required:true
    },
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [array => array.length === 4, 'Must have exactly 4 options']
    },
    answer: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;