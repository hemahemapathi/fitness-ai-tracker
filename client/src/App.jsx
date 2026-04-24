import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingPage from './components/LoadingPage/LoadingPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import LoginPage from './components/LoginPage/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage/ForgotPasswordPage';
import AboutYouPage from './components/AboutYouPage/AboutYouPage';
import HomePage from './components/HomePage/HomePage';
import WorkoutPage from './components/Workout/WorkoutPage/WorkoutPage';
import Workouts from './components/Workout/Workouts/Workouts';
import NutritionPage from './components/NutritionPage/NutritionPage';
import ReviewsPage from './components/ReviewsPage/ReviewsPage';
import TrackingPage from './components/TrackingPage/TrackingPage';
import GoalPage from './components/GoalPage/GoalPage';
import ProfilePage from './components/ProfilePage/ProfilePage';
import NotificationPage from './components/NotificationPage/NotificationPage';
import AICoachPage from './components/AICoachPage/AICoachPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const CheckDay = ({ children }) => {
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch(`${import.meta.env.VITE_API_URL}/goals/check-day`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
      } catch { /* silent */ }
    };
    run();
  }, []);
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about-you" element={<ProtectedRoute><AboutYouPage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><CheckDay><HomePage /></CheckDay></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/workout-player" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><GoalPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;