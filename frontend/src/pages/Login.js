import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    const result = await loginWithGoogle(credentialResponse);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Google login failed');
    }

    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        {/* Google OAuth Login */}
        <div className="google-login-section">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleEmailSubmit} className="email-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
