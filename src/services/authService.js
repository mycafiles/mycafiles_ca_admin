import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    caLogin: async (email, password, role) => {
        const response = await api.post('/auth/ca-login', { email, password, role });
        return response.data;
    },

    clientLogin: async (mobileNumber, panNumber) => {
        const response = await api.post('/auth/client-login', { mobileNumber, panNumber });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
