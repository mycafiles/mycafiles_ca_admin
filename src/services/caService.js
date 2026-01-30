import api from './api';

export const caService = {
    getCas: async () => {
        const response = await api.get('/ca/view');
        return response.data;
    },

    createCa: async (caData) => {
        const response = await api.post('/ca/create', caData);
        return response.data;
    },

    updateCa: async (id, caData) => {
        const response = await api.put(`/ca/edit/${id}`, caData);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/ca/update-status/${id}`, { status });
        return response.data;
    },

    deleteCa: async (id) => {
        const response = await api.delete(`/ca/delete/${id}`);
        return response.data;
    }
};
