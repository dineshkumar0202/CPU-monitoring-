import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cpu-monitor-server.onrender.com' || import.meta.env.VITE_API_URL
});

export default api;
  