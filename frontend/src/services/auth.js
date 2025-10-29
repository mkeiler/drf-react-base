import api from './api';

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    const response = await api.post('/auth/_allauth/browser/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Signup with email and password
  signup: async (email, password) => {
    const response = await api.post('/auth/_allauth/browser/v1/auth/signup', {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.delete('/auth/_allauth/browser/v1/auth/session');
    return response.data;
  },

  // Get current user session
  getSession: async () => {
    const response = await api.get('/auth/_allauth/browser/v1/auth/session');
    return response.data;
  },

  // Get Google OAuth provider URL
  getProviderURL: async (provider, callbackUrl) => {
    const response = await api.get(
      `/auth/_allauth/browser/v1/auth/provider/redirect`,
      {
        params: {
          provider,
          callback_url: callbackUrl,
          process: 'login',
        },
      }
    );
    return response.data;
  },

  // Handle provider callback (token)
  providerToken: async (provider, token) => {
    const response = await api.post(
      `/auth/_allauth/browser/v1/auth/provider/token`,
      {
        provider,
        token,
      }
    );
    return response.data;
  },
};
