import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuizDetails() {
    const { title } = useParams();
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch quiz questions
                const questionRes = await fetch(`http://localhost:3000/api/questions/quiz/${encodeURIComponent(title)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                });

                if (!questionRes.ok) {
                    throw new Error(`Questions fetch failed (${questionRes.status})`);
                }

                const questionData = await questionRes.json();
                setQuestions(questionData.questions || []);

                // Fetch student results
                const resultRes = await fetch(`http://localhost:3000/api/results/quiz/${encodeURIComponent(title)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                });

                if (!resultRes.ok) {
                    throw new Error(`Results fetch failed (${resultRes.status})`);
                }

                const resultData = await resultRes.json();
                setResults(resultData || []);
            } catch (error) {
                console.error("Error loading quiz data:", error);
                alert("❌ Failed to load quiz questions or student results.");
            }
        };

        fetchQuizData();
    }, [title]);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>📘 Quiz: {title}</h2>

            <h3>📝 Questions</h3>
            {questions.length === 0 ? (
                <p>No questions found.</p>
            ) : (
                questions.map((q, index) => (
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
                ))
            )}

            <h3>📊 Student Results</h3>
            {results.length === 0 ? (
                <p>No student results available.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((student, idx) => (
                            <tr key={idx}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{student.studentName}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{student.email}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {student.score} / {student.total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default QuizDetails;
