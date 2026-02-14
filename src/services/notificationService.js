import api from './api';

export const notificationService = {
    async getNotifications() {
        const response = await api.get('/notifications');
        return response.data;
    },

    async markAsRead(id) {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    async markAllRead() {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    },

    async deleteNotification(id) {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    async sendTestNotification() {
        const response = await api.post('/notifications/test');
        return response.data;
    }
};
