import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizResults.css'; // Create this CSS file for styling

function QuizResults() {
    const { quizTitle } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (quizTitle) {
            // Fetch both results and questions in parallel
            Promise.all([
                fetchQuizResults(),
                fetchOriginalQuestions()
            ]).finally(() => {
                setIsLoading(false);
            });
        }
    }, [quizTitle]);

    const fetchQuizResults = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication required");
            }
            
            const encodedTitle = encodeURIComponent(quizTitle);
            const response = await fetch(`http://localhost:3000/api/completedQuizzes/${encodedTitle}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Quiz results not found");
                } else if (response.status === 401) {
                    throw new Error("You are not authorized to view these results");
                }
                throw new Error("Failed to fetch quiz results");
            }
            
            const data = await response.json();
            setResults(data);
            return data;
        } catch (error) {
            console.error("Error fetching quiz results:", error);
            setError(error.message || "Failed to load quiz results");
            return null;
        }
    };

    const fetchOriginalQuestions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return; // We'll handle the auth error in the other fetch
            }
            
            const encodedTitle = encodeURIComponent(quizTitle);
            const response = await fetch(`http://localhost:3000/api/questions/quiz/${encodedTitle}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.warn(`Warning: Failed to fetch original questions (${response.status})`);
                return;
            }
            
            const data = await response.json();
            if (data.questions && Array.isArray(data.questions)) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.warn("Warning: Error fetching original questions:", error);
            // Continue without the original questions
        }
    };

    const handleBackToQuizzes = () => {
        navigate('/student/StudentDashboard');
    };

    const getOptionText = (questionText, answerLetter, detailedIndex) => {
        // If no answer was provided, return "Not answered"
        if (!answerLetter && detailedIndex === undefined) {
            return "Not answered";
        }
    
        // Try to find the full option text from the original question data
        if (questions.length > 0) {
            const question = questions.find(q => q.question === questionText);
            if (question && question.options) {
                let index = -1;
    
                if (typeof answerLetter === 'string' && answerLetter.length === 1) {
                    // Convert letter (A, B, C, D) to index (0, 1, 2, 3)
                    index = answerLetter.charCodeAt(0) - 65;
                } else if (typeof detailedIndex === 'number') {
                    index = detailedIndex;
                }
    
                if (index >= 0 && index < question.options.length) {
                    let optionText = question.options[index];
                    const letterPrefix = `${String.fromCharCode(65 + index)}.`;
    
                    // Clean up option text if it already has letter prefix
                    if (optionText.startsWith(letterPrefix) || optionText.startsWith(`${letterPrefix} `)) {
                        optionText = optionText.substring(optionText.indexOf('.') + 1).trim();
                    }
    
                    return `${String.fromCharCode(65 + index)}. ${optionText}`;
                }
            }
        }
    
        // If no original options found but answerLetter exists, just show the letter
        if (answerLetter) {
            return `Option ${answerLetter}`;
        }
    
        return "Not answered"; // fallback
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Show loading indicator
    if (isLoading) {
        return (
            <div className="results-container loading">
                <h2>Loading Results</h2>
                <div className="loading-spinner"></div>
                <p>Please wait...</p>
            </div>
        );
    }

    // Show error message if any
    if (error) {
        return (
            <div className="results-container error">
                <h2>Error Loading Results</h2>
                <div className="error-message">{error}</div>
                <button className="btn primary" onClick={handleBackToQuizzes}>Back to Quiz List</button>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="results-container empty">
                <h2>No Results Available</h2>
                <p>Quiz results not found.</p>
                <button className="btn primary" onClick={handleBackToQuizzes}>Back to Quiz List</button>
            </div>
        );
    }

    // Show special message for cheating detection
    const showCheatingDetected = results.tabSwitchingDetected === true;

    return (
        <div className="results-container">
            <h1>Quiz Results</h1>
            
            <div className="results-summary">
                <h2>{decodeURIComponent(quizTitle)}</h2>
                
                {showCheatingDetected && (
                    <div className="cheating-alert">
                        <h3>⚠️ Potential Academic Integrity Violation</h3>
                        <p>Tab switching was detected during this quiz.</p>
                        <p>As a result, your score has been recorded as 0%.</p>
                    </div>
                )}
                
                <div className="score-display">
                    Your Score: <strong>{results.score.toFixed(1)}%</strong>
                </div>
                
                <div className="score-breakdown">
                    You answered <strong>{results.correctAnswers}</strong> out of <strong>{results.totalQuestions}</strong> questions correctly.
                </div>
                
                {results.completedAt && (
                    <div className="completion-time">
                        Completed on: {formatDate(results.completedAt)}
                    </div>
                )}
            </div>

            <h3>Detailed Results:</h3>
            
            <div className="results-details">
                {results.detailedResults.map((result, index) => (
                    <div 
                        key={index}
                        className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                    >
                        <p className="question-text"><strong>Q{index + 1}:</strong> {result.question}</p>
                        
                        <div className="answer-comparison">
                            <p className="user-answer">
                                Your answer: <strong>
                                    {getOptionText(
                                        result.question, 
                                        result.studentAnswerLetter || result.studentAnswer, 
                                        result.studentAnswerIndex
                                    )}
                                </strong>
                            </p>
                            
                            <p className="correct-answer">
                                Correct answer: <strong>
                                    {getOptionText(
                                        result.question, 
                                        result.correctAnswerLetter || result.correctAnswer
                                    )}
                                </strong>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="action-buttons">
                <button className="btn primary" onClick={handleBackToQuizzes}>Back to Dashboard</button>
                
                {/* Optional: Add a button to retry the quiz if your app allows retakes */}
                {!showCheatingDetected && (
                    <button 
                        className="btn secondary" 
                        onClick={() => navigate(`/student/StudentDashboard/quizzes/${encodeURIComponent(quizTitle)}`)}
                    >
                        Retake Quiz
                    </button>
                )}
            </div>
        </div>
    );
}

export default QuizResults;