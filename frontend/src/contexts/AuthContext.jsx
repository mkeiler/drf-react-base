import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authService.getSession();
      if (session.meta.is_authenticated) {
        setUser(session.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.meta.is_authenticated) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || 'Login failed',
      };
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await authService.signup(email, password);
      if (response.meta.is_authenticated) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || 'Signup failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await authService.getProviderURL(
        'google',
        window.location.origin + '/auth/callback'
      );
      if (response.data && response.data.location) {
        window.location.href = response.data.location;
      }
    } catch (error) {
      console.error('Google login failed:', error);
      return { success: false, error: 'Google login failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
