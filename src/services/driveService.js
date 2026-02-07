import api from './api';

export const driveService = {
    // 1. Fetch entire folder structure & files for a client
    getAllData: async (clientId) => {
        const response = await api.get(`/drive/${clientId}/all-data`);
        return response.data; // Returns { folders: [], files: [] }
    },

    // 2. Upload a file
    uploadFile: async (file, metadata) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientId', metadata.clientId);
        formData.append('folderId', metadata.folderId);
        formData.append('uploadedBy', 'CA'); // Or 'CLIENT' based on context
        formData.append('category', metadata.category || 'GENERAL');

        const response = await api.post('/drive/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // 3. Create a new folder manually (if needed)
    createFolder: async (name, customerId, parentFolderId) => {
        const response = await api.post('/drive/folders', {
            name,
            clientId,
            parentFolderId
        });
        return response.data;
    },

    // 4. Delete File
    // 4. Delete File (Soft Delete)
    deleteFile: async (id) => {
        const response = await api.delete(`/drive/files/${id}`);
        return response.data;
    },

    // 5. Delete Folder (Soft Delete)
    deleteFolder: async (id) => {
        const response = await api.delete(`/drive/folders/${id}`);
        return response.data;
    },

    // 6. Get Recycle Bin Items
    getBinItems: async (clientId) => {
        const response = await api.get(`/drive/${clientId}/bin`);
        return response.data;
    },

    // 7. Restore Item
    restoreItem: async (type, id) => {
        const response = await api.put(`/drive/restore/${type}/${id}`);
        return response.data;
    },

    // 8. Permanent Delete
    permanentDelete: async (type, id) => {
        const response = await api.delete(`/drive/permanent/${type}/${id}`);
        return response.data;
    }
};