import React from 'react'
import './App.css'
import Landing from './pages/landing.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Login from './pages/login.jsx'
import SignUp from './pages/signup.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import StudentDashboard from './pages/student/StudentDashboard.jsx'

import QuizTest from './pages/student/QuizTest.jsx';
import QuizResults from './pages/student/QuizResults.jsx';
import CameraComponent from './pages/student/camera.jsx';
import QuizDetails from './pages/admin/QuizDetails.jsx';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp/> }/>
        <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/student/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/student/StudentDashboard/quiz/:title" element={<QuizDetails />} />
        <Route path="/student/StudentDashboard/camera" element={<CameraComponent />} />
        <Route path="/student/StudentDashboard/quizTest/:quizTitle" element={<QuizTest />} />
        <Route path="/student/StudentDashboard/resultview/:quizTitle" element={<QuizResults />} />
      </Routes>
    </Router>
  );
}
export default App;
