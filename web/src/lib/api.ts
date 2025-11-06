import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshTokenQueue } from './refreshTokenQueue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const IS_PRODUCTION = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const USE_MOCK_DATA = IS_PRODUCTION && !process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        let accessToken: string;

        if (refreshTokenQueue.refreshing) {
          // Wait for the token to be refreshed
          accessToken = await refreshTokenQueue.enqueue();
        } else {
          refreshTokenQueue.refreshing = true;

          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;
          Cookies.set('accessToken', newToken, { expires: 7, secure: true });
          Cookies.set('refreshToken', newRefreshToken, { expires: 30, secure: true });
          
          refreshTokenQueue.resolveQueue(newToken);
          refreshTokenQueue.refreshing = false;
          accessToken = newToken;
        }
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshTokenQueue.rejectQueue(refreshError);
        refreshTokenQueue.refreshing = false;
        
        // Refresh failed, redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    if (USE_MOCK_DATA) {
      // Mock successful registration for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        user: { id: '1', name, email, role: 'USER' },
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token'
      };
    }
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      // Mock successful login for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        user: { id: '1', name: 'Demo User', email, role: 'USER' },
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token'
      };
    }
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'Logged out successfully' };
    }
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: '1', name: 'Demo User', email: 'demo@example.com', role: 'USER' };
    }
    const response = await api.post('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { accessToken: 'demo-access-token' };
    }
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export default api;
