import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handle_submit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("All fields are required!");
            return;
        }

        const formData = { email, password };

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);

                alert("Login successful!");

                if (data.user.role === 'admin') {
                    navigate('/admin/AdminDashboard');
                } else {
                    navigate('/student/StudentDashboard');
                }
            } else {
                alert(data.message || "Login failed! Please check your credentials.");
            }
        } catch (error) {
            console.error('Login error:', error);
            alert("Login request failed!");
        }
    };

    // ✅ return moved outside of handle_submit
    return (
        <div className="login-page">
            <form onSubmit={handle_submit}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
