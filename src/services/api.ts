import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
API.interceptors.request.use(
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

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    API.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    API.post('/auth/login', credentials),
  
  logout: () => API.get('/auth/logout'),
  
  getMe: () => API.get('/auth/me'),
  
  updateProfile: (userData: { name?: string }) =>
    API.put('/auth/updatedetails', userData),
};

// Resume API functions
export const resumeAPI = {
  getAll: () => API.get('/resumes'),
  
  getById: (id: string) => API.get(`/resumes/${id}`),
  
  create: (resumeData: any) => API.post('/resumes', resumeData),
  
  update: (id: string, resumeData: any) => API.put(`/resumes/${id}`, resumeData),
  
  delete: (id: string) => API.delete(`/resumes/${id}`),
  
  setDefault: (id: string) => API.put(`/resumes/${id}/default`),
};

// Session API functions
export const sessionAPI = {
  getAll: () => API.get('/sessions'),
  
  getUserSessions: () => API.get('/sessions/user'), // Get sessions for current user
  
  getById: (id: string) => API.get(`/sessions/${id}`),
  
  create: (sessionData: {
    sessionType: 'trial' | 'premium';
    company: string;
    position: string;
    resumeId?: string;
    language?: string;
    simpleEnglish?: boolean;
    extraInstructions?: string;
    aiModel?: string;
  }) => API.post('/sessions', sessionData),
  
  update: (id: string, updateData: {
    question?: string;
    answer?: string;
    confidence?: number;
    status?: 'active' | 'completed' | 'cancelled';
    feedback?: string;
    rating?: number;
  }) => API.put(`/sessions/${id}`, updateData),
  
  addQuestion: (id: string, questionData: {
    question: string;
    answer: string;
    confidence: number;
  }) => API.post(`/sessions/${id}/questions`, questionData),
  
  getQuestions: (id: string) => API.get(`/sessions/${id}/questions`),
  
  completeSession: (id: string, completionData: {
    status: 'completed';
    endTime: Date;
    duration: number;
  }) => API.put(`/sessions/${id}/complete`, completionData),
  
  delete: (id: string) => API.delete(`/sessions/${id}`),
};

// Health check
export const healthCheck = () => API.get('/health');

export default API;
