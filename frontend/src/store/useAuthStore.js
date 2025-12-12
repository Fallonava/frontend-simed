import { create } from 'zustand';
import api from '../utils/axiosConfig';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    error: null,
    isLoading: false,

    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/auth/login', { username, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
            return true;
        } catch (error) {
            const status = error.response?.status;
            const statusText = error.response?.statusText;
            const apiMessage = error.response?.data?.error; // Assuming backend sends { error: "..." }

            let finalMessage = 'Login failed';

            if (status) {
                finalMessage = `Login failed (${status} ${statusText}): ${apiMessage || 'No details'}`;
            } else if (error.request) {
                // The request was made but no response was received
                finalMessage = `Network Error: No response received via ${error.message}`;
            } else {
                // Something happened in setting up the request
                finalMessage = `Request Error: ${error.message}`;
            }

            console.error("Login Error Detail:", error);

            set({
                error: finalMessage,
                isLoading: false
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    }
}));

export default useAuthStore;
