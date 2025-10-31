import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // important for sanctum cookie
  headers: { Accept: 'application/json' }
});

export default api;
