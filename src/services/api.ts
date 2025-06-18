import axios from 'axios'; // its a library used to call CURLs (APIs)
import { API_ENDPOINTS } from '@/config/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
export const login = async (username: string, password: string) => {
  return api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
};

export const logout = async () => {
  return api.post(API_ENDPOINTS.AUTH.LOGOUT);
};

// Document Processing
export const uploadDocuments = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('documents', file);
  });
  return api.post('/upload_documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const processUrl = async (urls: string) => {
  return api.post('/process_url', { urls });
};

// Chat and Query
export const queryRagSystem = async (prompt: string) => {
  return api.post('/query', { prompt });
};

export const chatWithAssistant = async (message: string) => {
  return api.post('/chat', { message });
};

// Image Processing
export const analyzeImage = async (image: File, prompt: string) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('prompt', prompt);
  return api.post('/analyze_image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new Error(error.response.data.detail || error.response.data.message);
    }
    throw error;
  }
);
