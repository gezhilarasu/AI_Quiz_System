const Question = require('../models/Question');
const saveQuestions = async (req, res) => {
    try {
        const teacher_Id = req.user?._id;
        if (!teacher_Id) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }

        const { title, questionsData } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: "Quiz title is required." });
        }

        if (!Array.isArray(questionsData) || questionsData.length === 0) {
            return res.status(400).json({ message: "No questions data provided." });
        }

        // Directly store all provided questions, even if duplicates
        const questionsToSave = questionsData.map(q => ({
            ...q,
            title,
            teacher_Id
        }));

        const savedQuestions = await Question.insertMany(questionsToSave);

        return res.status(201).json({
            message: `Saved ${savedQuestions.length} question(s) to quiz "${title}".`,
            questions: savedQuestions
        });
    } catch (error) {
        console.error("Error saving questions:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation error",
                details: error.message
            });
        }

        res.status(500).json({ message: "Failed to save questions." });
    }
};

const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const teacher_Id = req.user?._id;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid question ID format." });
        }
        
        // Find the question first to verify ownership
        const existingQuestion = await Question.findById(id);
        
        if (!existingQuestion) {
            return res.status(404).json({ message: "Question not found." });
        }
        
        // Verify teacher owns this question
        if (existingQuestion.teacher_Id.toString() !== teacher_Id.toString()) {
            return res.status(403).json({ message: "You don't have permission to update this question." });
        }
        
        // Update the question
        const updatedData = {
            ...req.body,
            updatedAt: Date.now()
        };
        
        const updatedQuestion = await Question.findByIdAndUpdate(
            id, 
            updatedData, 
            { new: true, runValidators: true }
        );
        
        res.json({ 
            message: "Question updated successfully!", 
            question: updatedQuestion 
        });
    } catch (error) {
        console.error("Error updating question:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation error", 
                details: error.message 
            });
        }
        
        res.status(500).json({ message: "Failed to update question." });
    }
};

const getAllQuizTitles = async (req, res) => {
    try {
        const teacher_Id = req.user?._id;
        
        console.log("Decoded Teacher ID:", teacher_Id); // Log the decoded teacher ID
       
        if (!teacher_Id) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }
        
        // Get distinct titles from the Question collection for this teacher
        const titles = await Question.distinct('title', { teacher_Id });
        
        res.json({ titles: titles });
    } catch (error) {
        console.error("Error fetching quiz titles:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAllQuizTitlesForStudent = async (req, res) => {
    try{
        const titles=await Question.distinct('title');
        return res.status(200).json({titles});
    }
    catch (error) {
        console.error("Error fetching quiz titles:", error);
        res.status(500).json({ message: "Server error", error: error.message });    
    }
};

const getQuizByTitle = async (req, res) => {
    const quizTitle = req.params;// already a string, just use it directl

    const teacher_Id = req.user?._id;

    if (!quizTitle) {
        return res.status(400).json({ message: "Quiz title is required" });
    }

    try {
        if (!teacher_Id) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }
        console.log(quizTitle, teacher_Id); // Log the title and teacher ID for debugging
        const questions = await Question.find({
            title: quizTitle,
            teacher_Id: teacher_Id
        });
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz" });
        }
        
        res.status(200).json({ questions });
    } catch (error) {
        console.log("Error in fetching quiz questions:", error);
        res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
};

// Add a new controller to delete a quiz by title
const deleteQuizByTitle = async (req, res) => {
    const { title } = req.params;
    const teacher_Id = req.user?._id;
    
    if (!title) {
        return res.status(400).json({ message: "Quiz title is required" });
    }
    
    try {
        if (!teacher_Id) {
            return res.status(401).json({ message: "Unauthorized. Teacher ID not found." });
        }
        
        const result = await Question.deleteMany({ 
            title: title,
            teacher_Id: teacher_Id
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No questions found for this quiz or you don't have permission" });
        }
        
        res.status(200).json({ 
            message: `Quiz "${title}" deleted successfully. ${result.deletedCount} questions removed.` 
        });
    } catch (error) {
        console.log("Error deleting quiz:", error);
        res.status(500).json({ message: "Failed to delete quiz" });
    }
};

const getQuizByTitleforstudent = async (req, res) => {
    const quizTitle = req.params.title;

    console.log("quiz title for fetching",quizTitle); // Log the title for debugging


    if (!quizTitle) {
        return res.status(400).json({ message: "Quiz title is required" });
    }

    try {

        const questions = await Question.find({
            title: quizTitle
        });
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz" });
        }
        
        res.status(200).json({ questions });
    } catch (error) {
        console.log("Error in fetching quiz questions:", error);
        res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
};
module.exports = {
    saveQuestions,
    updateQuestion, 
    getAllQuizTitles, 
    getAllQuizTitlesForStudent,
    getQuizByTitle,
    getQuizByTitleforstudent,
    deleteQuizByTitle
};