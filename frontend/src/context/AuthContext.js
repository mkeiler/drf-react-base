import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithGoogle, loginWithEmail, logout, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Google login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const handleEmailLogin = async (email, password) => {
    try {
      const response = await loginWithEmail(email, password);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Email login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle: handleGoogleLogin,
    loginWithEmail: handleEmailLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
