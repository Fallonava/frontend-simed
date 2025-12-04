import { create } from 'zustand';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

const useQueueStore = create((set, get) => ({
    socket: null,
    doctors: [],
    isConnected: false,

    // Initialize Socket and fetch initial data
    initialize: async () => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            set({ isConnected: true });
            console.log('Socket connected');
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
            console.log('Socket disconnected');
        });

        socket.on('status_update', (updatedQuota) => {
            // Update the specific doctor's quota in the list
            set((state) => ({
                doctors: state.doctors.map((doc) =>
                    doc.id === updatedQuota.doctor_id
                        ? { ...doc, quota: updatedQuota }
                        : doc
                )
            }));
        });

        socket.on('queue_update', ({ ticket, updatedQuota, doctor }) => {
            // Handle queue update if needed, mostly covered by status_update for dashboard
            // But might be useful for toast notifications or specific queue lists
            set((state) => ({
                doctors: state.doctors.map((doc) =>
                    doc.id === updatedQuota.doctor_id
                        ? { ...doc, quota: updatedQuota }
                        : doc
                )
            }));
        });

        set({ socket });
        await get().fetchDoctors();
    },

    fetchDoctors: async () => {
        try {
            const response = await axios.get(`${API_URL}/doctors`);
            set({ doctors: response.data });
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        }
    },

    toggleStatus: async (doctorId, status, maxQuota) => {
        try {
            await axios.post(`${API_URL}/quota/toggle`, {
                doctor_id: doctorId,
                status,
                max_quota: maxQuota
            });
            // State update will happen via socket event
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    },

    takeTicket: async (doctorId) => {
        try {
            const response = await axios.post(`${API_URL}/queue/ticket`, { doctor_id: doctorId });
            return response.data;
        } catch (error) {
            console.error('Failed to take ticket:', error);
            throw error;
        }
    },

    generateQuota: async () => {
        try {
            await axios.post(`${API_URL}/quota/generate`);
            await get().fetchDoctors();
        } catch (error) {
            console.error('Failed to generate quota:', error);
        }
    }
}));

export default useQueueStore;
