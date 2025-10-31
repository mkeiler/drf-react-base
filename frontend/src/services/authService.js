import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('accessToken', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Login with Google
export async function loginWithGoogle(idToken) {
  try {
    const response = await api.post('/google/', {
      id_token: idToken,
    });

    const { access, refresh, user } = response.data;

    // Store tokens
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    return { user };
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Google login failed');
  }
}

// Login with email and password
export async function loginWithEmail(email, password) {
  try {
    const response = await api.post('/login/', {
      email,
      password,
    });

    const { access_token, refresh_token, user } = response.data;

    // Store tokens
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);

    return { user };
  } catch (error) {
    throw new Error(
      error.response?.data?.non_field_errors?.[0] ||
      error.response?.data?.detail ||
      'Login failed'
    );
  }
}

// Logout
export async function logout() {
  try {
    await api.post('/logout/');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const response = await api.get('/user/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to get user data');
  }
}

export default api;
