import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizTest.css'; // Import the CSS file

function QuizTest() {
    const { quizTitle } = useParams();
    const navigate = useNavigate();
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [pendingFinalAlert, setPendingFinalAlert] = useState(false);
    

    useEffect(() => {
        if (quizTitle) {
            fetchQuizQuestions();
        }
    }, [quizTitle]);

    // Handle showing the final alert when user returns to the tab
    useEffect(() => {
        if (pendingFinalAlert && !document.hidden) {
            // Reset the flag
            setPendingFinalAlert(false);
            
            // Show the alert and then proceed with submission
            alert("You have switched tabs 3 times. The quiz will be submitted with a score of 0% due to potential cheating behavior.");
            handleCheatingDetected();
        }
    }, [pendingFinalAlert, document.hidden]);

    // Prevent browser back button navigation
    useEffect(() => {
        // Save the current history state
        const currentState = window.history.state;
        
        // Push a new state to create history entry we can intercept
        window.history.pushState(null, null, window.location.pathname);
        
        // Event handler for popstate (when back button is clicked)
        const handlePopState = (event) => {
            // Prevent the default back action
            window.history.pushState(null, null, window.location.pathname);
            
            // Ask user if they really want to leave
            const confirmMessage = "Warning: Leaving the quiz will result in a score of 0%. Are you sure you want to exit?";
            
            if (window.confirm(confirmMessage)) {
                // If user confirms, handle as cheating/exit
                handleCheatingDetected();
            }
        };
        
        // Add event listener for back button
        window.addEventListener('popstate', handlePopState);
        
        // Clean up
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Add visibility change event listener for tab switching detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab is now hidden, increment the counter
                setTabSwitchCount(prev => {
                    const newCount = prev + 1;
                    console.log(`Tab switched. Total switches: ${newCount}`);
                    
                    if (newCount === 1 || newCount === 2) {
                        // We'll show these alerts when the user returns to the tab
                        // No immediate action needed
                    }
                    
                    if (newCount >= 3) {
                        // Set flag to show final alert when user returns to tab
                        setPendingFinalAlert(true);
                    }
                    
                    return newCount;
                });
            } else {
                // Tab is now visible again, show appropriate warnings based on count
                if (tabSwitchCount === 1 || tabSwitchCount === 2) {
                    alert(`Warning: Leaving the quiz tab has been detected! This quiz has anti-cheating measures. You have ${3 - tabSwitchCount} tab switches remaining before automatic submission.`);
                }
                // The case of tabSwitchCount >= 3 is handled by the separate useEffect above
            }
        };

        // Add event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [tabSwitchCount]);

    // Add handler for beforeunload to catch page refresh or closing attempts
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const message = "Leaving or refreshing this page will submit your quiz with a score of 0%. Are you sure you want to leave?";
            e.preventDefault();
            e.returnValue = message;
            return message;
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleCheatingDetected = async () => {
        console.log("Cheating behavior detected. Submitting quiz with zero score.");
        
        const quizResults = {
            quizTitle: decodeURIComponent(quizTitle),
            score: 0,
            correctAnswers: 0,
            totalQuestions: quizQuestions.length,
            detailedResults: quizQuestions.map(question => ({
                questionId: question._id,
                question: question.question,
                options: question.options,
                studentAnswer: "No answer (Cheating behavior detected)",
                studentAnswerIndex: null,
                studentAnswerLetter: null,
                correctAnswer: question.answer,
                correctAnswerLetter: question.answer?.charAt(0) || null,
                isCorrect: false
            })),
            tabSwitchingDetected: true
        };

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/completedQuizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(quizResults)
            });

            if (response.ok) {
                navigate(`/student/StudentDashboard/resultview/${encodeURIComponent(quizTitle)}`, { replace: true });
            } else {
                const data = await response.json();
                throw new Error(data.message || "Failed to save quiz results");
            }
        } catch (error) {
            console.error("Error saving quiz results:", error);
            // Try to navigate anyway even if saving failed
            navigate(`/student/StudentDashboard`, { replace: true });
        }
    };

    const fetchQuizQuestions = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            const encodedTitle = encodeURIComponent(quizTitle);
            
            const response = await fetch(`http://localhost:3000/api/questions/quiz/student/${encodedTitle}`, {
                method:"GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.questions && Array.isArray(data.questions)) {
                const studentQuestions = data.questions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                }));
                
                setQuizQuestions(studentQuestions);
                setCurrentQuestionIndex(0);
            } else {
                throw new Error("No questions found for this quiz");
            }
        } catch (error) {
            console.error("Error fetching quiz questions:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleBackToQuizzes = () => {
        const confirmMessage = "Warning: Exiting the quiz will result in a score of 0%. Are you sure you want to exit?";
        
        if (window.confirm(confirmMessage)) {
            handleCheatingDetected();
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
    
        const totalQuestions = quizQuestions.length;
        let correctAnswers = 0;
    
        const detailedResults = quizQuestions.map(question => {
            const studentAnswerIndex = selectedAnswers[question._id];
            const studentAnswerLetter = studentAnswerIndex !== undefined
                ? String.fromCharCode(65 + studentAnswerIndex)
                : null;
        
            const studentAnswer = studentAnswerIndex !== undefined 
                ? question.options[studentAnswerIndex] 
                : "No answer provided";  // Default value for unanswered questions
        
            let correctAnswerLetter = null;
            if (question.answer) {
                if (question.answer.length === 1 && question.answer >= 'A' && question.answer <= 'D') {
                    correctAnswerLetter = question.answer;
                } else {
                    correctAnswerLetter = question.answer.charAt(0);
                    if (correctAnswerLetter < 'A' || correctAnswerLetter > 'D') {
                        const correctAnswerIndex = question.options.findIndex(opt =>
                            opt === question.answer || opt.includes(question.answer)
                        );
                        if (correctAnswerIndex !== -1) {
                            correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex);
                        }
                    }
                }
            }
        
            const isCorrect = studentAnswerLetter === correctAnswerLetter;
            if (isCorrect) correctAnswers++;
        
            return {
                questionId: question._id,
                question: question.question,
                options: question.options,
                studentAnswer: studentAnswer,
                studentAnswerIndex,
                studentAnswerLetter,
                correctAnswer: question.answer,
                correctAnswerLetter,
                isCorrect
            };
        });
        
    
        const studentAnswers = quizQuestions.map(question => ({
            questionId: question._id,
            selectedOptionIndex: selectedAnswers[question._id],
            selectedOptionLetter: selectedAnswers[question._id] !== undefined 
                ? String.fromCharCode(65 + selectedAnswers[question._id]) 
                : null
        }));
    
        const quizResults = {
            quizTitle: decodeURIComponent(quizTitle),
            score: (correctAnswers / totalQuestions) * 100,
            correctAnswers,
            totalQuestions,
            detailedResults,
            studentAnswers
        };
    
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/completedQuizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(quizResults)
            });
    
            if (response.ok) {
                navigate(`/student/StudentDashboard/resultview/${encodeURIComponent(quizTitle)}`, { replace: true });
            } else {
                const data = await response.json();
                throw new Error(data.message || "Failed to save quiz results");
            }
        } catch (error) {
            console.error("Error saving quiz results:", error);
            setError("Failed to save quiz results. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };
    
    const QuizContent = () => {
        if (isLoading) {
            return (
                <div className="quiz-container center-text">
                    <h2>Loading Quiz: {decodeURIComponent(quizTitle)}</h2>
                    <div>Please wait...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="quiz-container">
                    <h2>Error Loading Quiz</h2>
                    <div className="error-message">{error}</div>
                    <button onClick={handleBackToQuizzes}>Back to Quiz List</button>
                </div>
            );
        }
        if (quizQuestions.length === 0) {
            return (
                <div className="quiz-container center-text">
                    <h2>No Questions Available</h2>
                    <p>This quiz doesn't have any questions yet.</p>
                    <button onClick={handleBackToQuizzes}>Back to Quiz List</button>
                </div>
            );
        }
        const currentQuestion = quizQuestions[currentQuestionIndex];
        
        return (
            <div className="quiz-container">
                <h1>{decodeURIComponent(quizTitle)}</h1>
                
                <div className="quiz-header">
                    <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                    <button onClick={handleBackToQuizzes}>Exit Quiz</button>
                </div>

                <div className="question-card">
                    <h3>{currentQuestion.question}</h3>
                    
                    <div className="options-list">
                        {currentQuestion.options.map((option, index) => {
                            let cleanOption = option;
                            if (option.startsWith(`${String.fromCharCode(65 + index)}.`) || 
                                option.startsWith(`${String.fromCharCode(65 + index)}. `)) {
                                cleanOption = option.substring(option.indexOf('.') + 1).trim();
                            }
                            
                            return (
                                <div 
                                    key={index}
                                    className={`option ${selectedAnswers[currentQuestion._id] === index ? "selected" : ""}`}
                                    onClick={() => handleOptionSelect(currentQuestion._id, index)}
                                >
                                    {String.fromCharCode(65 + index)}. {cleanOption}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="navigation-buttons">
                    <button 
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </button>
                    
                    {currentQuestionIndex === quizQuestions.length - 1 ? (
                        <button 
                            onClick={handleSubmitQuiz}
                            disabled={submitting}
                            className="submit-button"
                        >
                            {submitting ? "Submitting..." : "Submit Quiz"}
                        </button>
                    ) : (
                        <button onClick={handleNextQuestion}>
                            Next
                        </button>
                    )}
                </div>
                
                <div className="tab-switch-info">
                    <p>⚠️ Do not leave this tab or use browser navigation during the quiz (switches: {tabSwitchCount}/3)</p>
                </div>
            </div>
            
        );
    };

    return <QuizContent />;
}
export default QuizTest;