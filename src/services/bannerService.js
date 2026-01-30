import api from './api';

const bannerService = {
    getAllBanners: async () => {
        const response = await api.get('/ca_connect/banners/admin');
        return response.data;
    },

    createBanner: async (bannerData) => {
        const response = await api.post('/ca_connect/banners', bannerData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteBanner: async (id) => {
        const response = await api.delete(`/ca_connect/banners/${id}`);
        return response.data;
    },

    toggleBanner: async (id) => {
        const response = await api.patch(`/ca_connect/banners/${id}/toggle`);
        return response.data;
    }
};

export default bannerService;
