import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User,CheckAuthResponse } from '../types';


export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);

    if(response.data.token){
      localStorage.setItem('token',response.data.token)
    }
    return response.data;
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post('/auth/register', userData);
  
       if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
  },


  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Check authentication status
checkAuth: async (): Promise<CheckAuthResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { isAuthenticated: false, user: null };
    }
    console.log(token)

    // ✅ Extract user from token (no API call)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    console.log(payload)
    const user: User = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
    };

    return { isAuthenticated: true, user };
    
  } catch (error) {
    console.error('Invalid JWT token:', error);
    localStorage.removeItem('token');
    return { isAuthenticated: false, user: null };
  }
},

};