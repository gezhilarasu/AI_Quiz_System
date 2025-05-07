import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

function AdminDashboard() {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editedQuestions, setEditedQuestions] = useState({});

    const [quizTitles, setQuizTitles] = useState([]);
    const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const navigate = useNavigate();

    const fetchQuizTitles = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Using token:", token); // Debug token
            
            const response = await fetch("http://localhost:3000/api/questions/titles", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log("Response status:", response.status); // Log status code
            
            const data = await response.json();
            console.log("Response data:", data); // Log the actual response
            
            if (response.ok) {
                // Check if data.titles exists and is an array
                if (data.titles && Array.isArray(data.titles)) {
                    setQuizTitles(data.titles);
                } else {
                    console.error("Invalid response format:", data);
                    alert("Failed to fetch quiz titles: Invalid response format");
                }
            } else {
                alert(`Failed to fetch quiz titles: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error fetching titles:", error);
            alert(`Error fetching quiz titles: ${error.message}`);
        }
    };
    
    useEffect(() => {
        fetchQuizTitles();
    }, []);
    
    const handleTitleClick = async (title) => {
        navigate(`/student/StudentDashboard/quiz/${encodeURIComponent(title)}`);
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setQuestions([]);
            setEditedQuestions({});
            setEditingQuestionId(null);
        }
    };

    const handleUploadAndGenerate = async () => {
        if (!file) {
            alert("Please choose a file.");
            return;
        }

        const formData = new FormData();
        formData.append("material", file);

        setIsProcessing(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/materials/generate-questions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && Array.isArray(data.questions)) {
                setQuestions(data.questions.map(q => ({ ...q, _id: Math.random().toString(36).substring(7) })));
                setEditedQuestions({});
                alert("✅ Questions generated successfully!");
            } else {
                alert(data.message || "❌ Failed to generate questions.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ An error occurred while uploading or generating questions.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditQuestion = (id, questionToEdit) => {
        setEditingQuestionId(id);
        setEditedQuestions(prev => ({
            ...prev,
            [id]: { ...questionToEdit }
        }));
    };

    const handleInputChange = (id, name, value) => {
        setEditedQuestions(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [name]: value
            }
        }));
    };

    const handleOptionChange = (id, index, value) => {
        setEditedQuestions(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                options: prev[id].options.map((opt, i) => (i === index ? value : opt))
            }
        }));
    };

    const handleSaveEdit = (id) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q._id === id ? editedQuestions[id] : q
            )
        );
        setEditingQuestionId(null);
    };

    const handleSaveAllQuestions = async () => {
        const quizTitle = prompt("Enter a title for this quiz:", "Lecture 1 Quiz");
        if (!quizTitle || quizTitle.trim() === "") {
            alert("❌ Quiz title is required to save.");
            return;
        }
    
        setIsProcessing(true);
        try {
            const token = localStorage.getItem("token");
            const questionsToSave = questions.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer
            }));
    
            const response = await fetch("http://localhost:3000/api/questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: quizTitle,
                    questionsData: questionsToSave
                })
            });
    
            const data = await response.json();
            if (response.ok) {
                alert(data.message || "✅ Questions saved to database!");
                // Refresh the quiz titles list after saving
                fetchQuizTitles();
                
                if (data.questions && data.questions.length === questions.length) {
                    setQuestions(prev =>
                        prev.map((q, index) => ({ ...q, _id: data.questions[index]._id }))
                    );
                }
            } else {
                alert(data.message || "❌ Failed to save questions to database.");
            }
        } catch (error) {
            console.error("Error saving all questions:", error);
            alert("❌ An error occurred while saving questions.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="admin-dashboard" style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
            <h1>Staff Dashboard</h1>
            <p>Upload lecture materials to generate and edit quiz questions.</p>

            <div style={{ marginBottom: "2rem" }}>
                <label><strong>📂 Upload File:</strong></label><br />
                <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.txt,.mp4"
                    onChange={handleFileChange}
                />
                <br /><br />
                <button onClick={handleUploadAndGenerate} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "📤 Upload & Generate Questions"}
                </button>
            </div>

            {questions.length > 0 && (
                <div>
                    <h2>📝 Generated Questions</h2>
                    {questions.map((q, index) => (
                        <div
                            key={q._id || index}
                            style={{
                                marginBottom: "1.5rem",
                                padding: "1rem",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            {editingQuestionId === q._id ? (
                                <div>
                                    <label><strong>Q{index + 1}:</strong></label>
                                    <input
                                        type="text"
                                        name="question"
                                        value={editedQuestions[q._id]?.question || ""}
                                        onChange={(e) => handleInputChange(q._id, "question", e.target.value)}
                                        style={{ width: '100%', marginBottom: '0.5rem' }}
                                    />
                                    <ol type="A">
                                        {(editedQuestions[q._id]?.options || []).map((opt, i) => (
                                            <li key={i}>
                                                <input
                                                    type="text"
                                                    value={opt || ""}
                                                    onChange={(e) => handleOptionChange(q._id, i, e.target.value)}
                                                    style={{ width: '90%', marginRight: '0.5rem' }}
                                                />
                                            </li>
                                        ))}
                                    </ol>
                                    <label><strong>Answer:</strong></label>
                                    <input
                                        type="text"
                                        name="answer"
                                        value={editedQuestions[q._id]?.answer || ""}
                                        onChange={(e) => handleInputChange(q._id, "answer", e.target.value)}
                                        style={{ width: '50%', marginBottom: '0.5rem' }}
                                    />
                                    <button onClick={() => handleSaveEdit(q._id)}>Save</button>
                                </div>
                            ) : (
                                <div>
                                    <p><strong>Q{index + 1}:</strong> {q.question}</p>
                                    <ol type="A">
                                        {(q.options || []).map((opt, i) => (
                                            <li key={i}>{opt}</li>
                                        ))}
                                    </ol>
                                    <p><strong>Answer:</strong> {q.answer}</p>
                                    <button onClick={() => handleEditQuestion(q._id, q)}>Edit</button>
                                </div>
                            )}
                        </div>
                    ))}
                    <button onClick={handleSaveAllQuestions} disabled={isProcessing || questions.length === 0}>
                        {isProcessing ? "Saving..." : "💾 Save All Questions"}
                    </button>
                </div>
            )}
            
            <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                <h2>📚 All Quizzes</h2>
                {quizTitles.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {quizTitles.map((title, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleTitleClick(title)}
                                style={{
                                    padding: "8px 12px",
                                    backgroundColor: selectedQuizTitle === title ? "#4CAF50" : "#f1f1f1",
                                    color: selectedQuizTitle === title ? "white" : "black",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                {title}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p>No quizzes found. Create one by uploading materials and saving questions.</p>
                )}
            </div>
            
            {selectedQuizTitle && quizQuestions.length > 0 && (
                <div>
                    <h2>Questions for: {selectedQuizTitle}</h2>
                    {quizQuestions.map((q, index) => (
                        <div
                            key={q._id || index}
                            style={{
                                marginBottom: "1.5rem",
                                padding: "1rem",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                backgroundColor: "#f9f9f9"
                            }}
                        >
                            <p><strong>Q{index + 1}:</strong> {q.question}</p>
                            <ol type="A">
                                {(q.options || []).map((opt, i) => (
                                    <li key={i}>{opt}</li>
                                ))}
                            </ol>
                            <p><strong>Answer:</strong> {q.answer}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;