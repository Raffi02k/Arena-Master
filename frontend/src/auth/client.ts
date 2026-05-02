import axios from 'axios';

// Create an Axios instance pointing to our backend
// Since Vite proxies /api and /token, we can use relative paths
export const client = axios.create();

// Add a request interceptor to attach the JWT token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
