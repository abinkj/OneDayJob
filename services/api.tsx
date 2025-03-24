import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8000/api/auth'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('token'); // Use AsyncStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  

export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const refreshToken = (data) => api.post('/refresh-token', data);
export const logout = () => api.post('/logout');
export const requestOtp = (data) => api.post('/otp/request', data);
export const verifyOtp = (data) => api.post('/otp/verify', data);
export const test = () => api.get('/test');
export const protectedRoute = () => api.get('/protected');