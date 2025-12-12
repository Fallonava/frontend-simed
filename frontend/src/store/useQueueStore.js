import { create } from 'zustand';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const useQueueStore = create((set, get) => ({
    socket: null,
    doctors: [],
    currentCalling: null,
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

        socket.on('call_patient', ({ ticket, doctor }) => {
            set((state) => ({
                currentCalling: { ticket, doctor }
            }));
            // Clear calling state after 10 seconds (optional, or keep it)
            // setTimeout(() => set({ currentCalling: null }), 10000);
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
        // Optimistic Update
        set((state) => ({
            doctors: state.doctors.map((doc) =>
                doc.id === doctorId
                    ? {
                        ...doc,
                        quota: {
                            ...doc.quota,
                            status: status,
                            max_quota: maxQuota,
                            // Ensure other fields exist if quota was null
                            doctor_id: doctorId,
                            current_count: doc.quota?.current_count || 0
                        }
                    }
                    : doc
            )
        }));

        try {
            await axios.post(`${API_URL}/quota/toggle`, {
                doctor_id: doctorId,
                status,
                max_quota: maxQuota
            });
            // Socket will confirm the update, but we already updated UI
        } catch (error) {
            console.error('Failed to toggle status:', error);
            // Revert or fetch fresh data on error
            get().fetchDoctors();
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

    callNext: async (doctorId) => {
        try {
            const response = await axios.post(`${API_URL}/queue/call`, { doctor_id: doctorId });
            return response.data;
        } catch (error) {
            console.error('Failed to call next patient:', error);
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
