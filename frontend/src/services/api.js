import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Handle different error statuses
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePhoto: (formData) => api.post('/users/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeProfilePhoto: () => api.delete('/users/profile/photo'),
  searchUsers: (params) => api.get('/users/search', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  addSkill: (skillData) => api.post('/users/skills', skillData),
  removeSkill: (id) => api.delete(`/users/skills/${id}`),
  addAvailability: (availabilityData) => api.post('/users/availability', availabilityData),
  removeAvailability: (id) => api.delete(`/users/availability/${id}`),
};

export const skillAPI = {
  getSkills: (params) => api.get('/skills', { params }),
  searchSkills: (query) => api.get('/skills/search', { params: query }),
  getCategories: () => api.get('/skills/categories'),
  getSkill: (id) => api.get(`/skills/${id}`),
  createSkill: (skillData) => api.post('/skills', skillData),
  getPopularSkills: (limit) => api.get('/skills/popular', { params: { limit } }),
};

export const swapAPI = {
  createSwapRequest: (swapData) => api.post('/swaps', swapData),
  getSwapRequests: (params) => api.get('/swaps', { params }),
  getSwapRequest: (id) => api.get(`/swaps/${id}`),
  updateSwapStatus: (id, statusData) => api.put(`/swaps/${id}/status`, statusData),
  cancelSwapRequest: (id) => api.delete(`/swaps/${id}`),
  deleteSwapRequest: (id) => api.delete(`/swaps/${id}/delete`),
  scheduleSwap: (id, scheduledDate) => api.put(`/swaps/${id}/status`, { status: 'ACCEPTED', scheduledDate }),
};

export const feedbackAPI = {
  createFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  getUserFeedback: (userId, params) => api.get(`/feedback/user/${userId}`, { params }),
  getSwapFeedback: (swapId) => api.get(`/feedback/swap/${swapId}`),
  getMyFeedback: (params) => api.get('/feedback/my', { params }),
  updateFeedback: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
};

export default api; 