import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css'; // Import the CSS file

function StudentDashboard() {
    const [quizTitles, setQuizTitles] = useState([]);
    const [completedQuizzes, setCompletedQuizzes] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizTitles();
        fetchCompletedQuizzes();
    }, []);

    const fetchCompletedQuizzes = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/completedQuizzes", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCompletedQuizzes(data);
            } else {
                console.error("Failed to fetch completed quizzes:", data.message);
            }
        } catch (error) {
            console.error("Error fetching completed quizzes:", error);
        }
    };

    const fetchQuizTitles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/questions/titles/student", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                if (data.titles && Array.isArray(data.titles)) {
                    setQuizTitles(data.titles);
                } else {
                    throw new Error("Invalid response format for quiz titles");
                }
            } else {
                throw new Error(data.message || "Failed to fetch quiz titles");
            }
        } catch (error) {
            console.error("Error fetching quiz titles:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuizSelect = (title) => {
        if (completedQuizzes[title]) {
            navigate(`/student/StudentDashboard/resultview/${encodeURIComponent(title)}`);
        } else {
            navigate(`/student/StudentDashboard/quizTest/${encodeURIComponent(title)}`);
        }
    };

    const handleRetest = (title, e) => {
        // Stop propagation to prevent the quiz card click from triggering
        e.stopPropagation();
        // Navigate directly to the quiz test page
        navigate(`/student/StudentDashboard/quizTest/${encodeURIComponent(title)}`);
    };

    if (isLoading) {
        return (
            <div className="student-dashboard">
                <h1>Student Dashboard</h1>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-dashboard">
                <h1>Student Dashboard</h1>
                <div className="error-message">
                    Error: {error}
                </div>
                <button onClick={fetchQuizTitles} className="retry-button">Retry</button>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            <h1>Student Dashboard</h1>
            <p>Select a quiz to begin:</p>

            {quizTitles.length > 0 ? (
                <div className="quiz-list">
                    {quizTitles.map((title, index) => (
                        <div
                            key={index}
                            className="quiz-card"
                            onClick={() => handleQuizSelect(title)}
                        >
                            <div>
                                <h3 className="quiz-title">{title}</h3>
                                {completedQuizzes[title] && (
                                    <span className="completed-info">
                                        Completed • Score: {completedQuizzes[title].score.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                            <div className="button-container">
                                <button className="quiz-button">
                                    {completedQuizzes[title] ? "View Results" : "Take Quiz"}
                                </button>
                                {completedQuizzes[title] && (
                                    <button 
                                        className="retest-button"
                                        onClick={(e) => handleRetest(title, e)}
                                    >
                                        Retake Quiz
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-quiz-message">
                    <p>No quizzes available yet.</p>
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;