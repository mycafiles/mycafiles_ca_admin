import api from './api';

export const clientService = {
    approveDevice: async (clientId) => {
        // Based on backend implementation possibility
        // Checking backend route structure for approval
        const response = await api.put(`/client/approve-device/${clientId}`);
        return response.data;
    },
    approveDevice: async (id) => {
        const response = await api.post(`/client/approve-device/${id}`);
        return response.data;
    },
    getClients: async () => {
        const response = await api.get('/client/view');
        return response.data;
    },

    getClientById: async (id) => {
        // Assume backend has GET /api/client/:id or filter by id in frontend
        // For now, we fetch all and find, or we can assume a route exists
        const response = await api.get(`/client/view`);
        return response.data.data.find(c => c._id === id);
    },

    createClient: async (clientData) => {
        const response = await api.post('/client/create', clientData);
        return response.data;
    },

    updateClient: async (id, clientData) => {
        const response = await api.put(`/client/edit/${id}`, clientData);
        return response.data;
    },

    deleteClient: async (id) => {
        const response = await api.delete(`/client/delete/${id}`);
        return response.data;
    },

    bulkUpload: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/client/bulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
        return response.data;
    }
};
