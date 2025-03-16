import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import toast from 'react-hot-toast';

// Create base axios instance
const api = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add rate limiting - 10 requests per second
const rateLimitedApi = rateLimit(api, { 
  maxRequests: 10,
  perMilliseconds: 1000,
  maxRPS: 10
});

// Add request interceptor for error handling
rateLimitedApi.interceptors.request.use(
  config => {
    // Add API keys if needed
    if (config.url?.includes('api.openweathermap.org')) {
      config.params = {
        ...config.params,
        appid: import.meta.env.VITE_WEATHER_API_KEY
      };
    }
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
rateLimitedApi.interceptors.response.use(
  response => response,
  error => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 401:
          toast.error('Unauthorized. Please check your API credentials.');
          break;
        case 403:
          toast.error('Access forbidden. Please check your permissions.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        default:
          toast.error('An error occurred. Please try again.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default rateLimitedApi;