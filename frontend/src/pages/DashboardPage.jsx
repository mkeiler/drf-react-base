import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!</h2>
          <p>You are successfully logged in.</p>
        </div>

        <div className="user-info-card">
          <h3>User Information</h3>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          {user?.first_name && (
            <div className="info-row">
              <span className="info-label">First Name:</span>
              <span className="info-value">{user.first_name}</span>
            </div>
          )}
          {user?.last_name && (
            <div className="info-row">
              <span className="info-label">Last Name:</span>
              <span className="info-value">{user.last_name}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
        </div>

        <div className="features-card">
          <h3>What's Next?</h3>
          <ul>
            <li>This is a protected route - only authenticated users can see it</li>
            <li>Your JWT tokens are automatically refreshed when they expire</li>
            <li>Add your own features and pages to build your application</li>
            <li>Check the README for setup and configuration instructions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
