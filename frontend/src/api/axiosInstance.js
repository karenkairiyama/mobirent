// frontend/src/api/axiosInstance.js
import axios from 'axios';
// Aquí leemos la variable de entorno VITE_API_URL
// Vite expone las variables de entorno prefijadas con VITE_ a través de import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_UR
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a cada request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;