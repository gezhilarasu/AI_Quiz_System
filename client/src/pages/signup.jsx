import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const navigate = useNavigate(); 

    const handle_submit = (e) => {
        e.preventDefault();

        // Manual validation (in addition to required)
        if (!name || !email || !password || !confirmPassword) {
            alert("All fields are required!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = {
            name,
            email,
            password,
            role,
        };

        console.log(formData);

        fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                navigate('/login'); // Redirect to login page after successful registration
                alert("Registration successful! Please log in.");   
            })
            .catch((error) => console.log(error));
    }

    return(
        <div className="sign-up-page">
            <form onSubmit={handle_submit}>
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

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

                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>    
                </select>

                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default SignUp;