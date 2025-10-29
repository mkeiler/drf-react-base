import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to DRF-React Base!</h1>
        {user && (
          <div className="user-info">
            <p className="greeting">Hello, {user.email}!</p>
            <p className="info">
              You are successfully logged in to the application.
            </p>
          </div>
        )}

        <div className="features">
          <h2>Features Implemented:</h2>
          <ul>
            <li>Django Rest Framework Backend</li>
            <li>React Frontend with Vite</li>
            <li>Email/Password Authentication</li>
            <li>Google OAuth Login</li>
            <li>Django Allauth Headless Integration</li>
            <li>Session-based Authentication</li>
          </ul>
        </div>

        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
