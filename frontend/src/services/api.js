import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production' || (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
const API_BASE_URL = isProduction
    ? 'https://study-tracker-26mq.onrender.com/api'
    : 'http://localhost:5001/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
