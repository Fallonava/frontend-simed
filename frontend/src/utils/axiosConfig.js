import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

// Create helper to access store outside of React components
let store;

export const injectStore = (_store) => {
    store = _store;
};

const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // Ensure URL ends with /api
    if (url.endsWith('/api')) return url;
    // Remove trailing slash if present and add /api
    return `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // If we have access to the store, we can use the logout action
            // Or roughly reload/redirect
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
