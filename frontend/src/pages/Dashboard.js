import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h2>DRF React App</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h1>Welcome to Your Dashboard!</h1>
          {user && (
            <div className="user-info">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {user.first_name && (
                <p>
                  <strong>Name:</strong> {user.first_name} {user.last_name}
                </p>
              )}
              <p>
                <strong>User ID:</strong> {user.id}
              </p>
            </div>
          )}
          <div className="dashboard-content">
            <h2>You're successfully authenticated!</h2>
            <p>
              This is a protected route that can only be accessed by authenticated users.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <h3>Google OAuth</h3>
                <p>Seamless authentication using your Google account</p>
              </div>
              <div className="feature-item">
                <h3>Email/Password</h3>
                <p>Traditional login with email and password</p>
              </div>
              <div className="feature-item">
                <h3>JWT Tokens</h3>
                <p>Secure token-based authentication with auto-refresh</p>
              </div>
              <div className="feature-item">
                <h3>Protected Routes</h3>
                <p>Route protection with automatic redirects</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
