import axios from 'axios';
import { setLoginState } from './api'; // Import login state setter

const API_BASE_URL = 'https://homeoai-backend-83yt.onrender.com/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds to accommodate Render backend cold starts
  withCredentials: true, // Include cookies in requests
});

// Cookies are preferred, with a Bearer-token fallback for cross-site
// Netlify → Render deployments where third-party cookies are blocked.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homeo_auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently in the login flow to prevent interceptor loops
let isLoggingIn = false;

// Response interceptor to handle token expiration and provide better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Session expired';
      console.error('❌ Authentication failed:', errorMessage);
      
      // Don't clear auth data if we're in the middle of logging in
      // This prevents Edge/Safari from getting logged out during token verification
      if (!isLoggingIn) {
        // Clear all auth data
        localStorage.removeItem('homeo_user');
        localStorage.removeItem('homeo_auth_token');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          // Show user-friendly message before redirect
          if (errorMessage.includes('expired')) {
            alert('Your session has expired. Please login again.');
          }
          window.location.href = '/';
        }
      } else {
        console.warn('⚠️ 401 during login flow - will retry after login completes');
      }
    }
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    isLoggingIn = true;
    setLoginState(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        if (token) {
          localStorage.setItem('homeo_auth_token', token);
          const savedToken = localStorage.getItem('homeo_auth_token');
          if (savedToken !== token) {
            throw new Error('Failed to save token to localStorage');
          }
        } else {
          throw new Error('No token received from server');
        }
        
        localStorage.setItem('homeo_user', JSON.stringify(user));
        
        // Give localStorage time to commit on Edge/Safari/Mobile
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify the token works immediately after login
        try {
          await authService.getProfile();
        } catch (verifyError) {
          // Don't throw — Edge/Safari/Mobile may need more time for cookies
        }
      }
      
      return response.data;
    } catch (error) {
      // Clear any partial auth data on failure
      localStorage.removeItem('homeo_user');
      localStorage.removeItem('homeo_auth_token');
      throw error;
    } finally {
      isLoggingIn = false;
      setLoginState(false);
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call backend logout to clear httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      // Always clear localStorage and redirect
      localStorage.removeItem('homeo_user');
      localStorage.removeItem('homeo_auth_token');
      window.location.href = '/';
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem('homeo_user');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is logged in (enhanced mobile checking)
  isAuthenticated: () => {
    const hasUser = Boolean(localStorage.getItem('homeo_user'));
    const hasToken = Boolean(localStorage.getItem('homeo_auth_token'));
    
    if (hasUser && !hasToken) {
      localStorage.removeItem('homeo_user');
      return false;
    }
    
    return hasUser && hasToken;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Admin: Get pending registrations
  getPendingRegistrations: async () => {
    const response = await api.get('/auth/pending');
    return response.data;
  },

  // Admin: Approve user
  approveUser: async (userId) => {
    const response = await api.put(`/auth/approve/${userId}`);
    return response.data;
  },

  // Admin: Reject user
  rejectUser: async (userId, reason) => {
    const response = await api.put(`/auth/reject/${userId}`, { reason });
    return response.data;
  },

  // Admin: Get all users
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Used as a fallback when the browser blocks third-party cookies.
  getToken: () => {
    return localStorage.getItem('homeo_auth_token');
  },

  // Check if user has required role
  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    return user && user.role === requiredRole;
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole('Admin');
  }
};

export default authService;
