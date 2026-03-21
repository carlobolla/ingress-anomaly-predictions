import axios from 'axios';

// Create axios instance with custom config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const stored = sessionStorage.getItem('auth');
        const token = stored ? JSON.parse(stored).token : null;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific HTTP errors
            switch (error.response.status) {
                case 500:
                    break;
                default:
                    break;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;