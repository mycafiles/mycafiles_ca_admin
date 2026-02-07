import axios from 'axios';
import { nprogress } from '@mantine/nprogress';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        nprogress.start();
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        nprogress.complete();
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        nprogress.complete();
        return response;
    },
    (error) => {
        nprogress.complete();
        return Promise.reject(error);
    }
);

export default api;
