/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = 'https://doctor-appointment-s3yb.onrender.com/api';

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};

// Auth API calls
export const authAPI = {
  register: (userData: any) => 
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  login: (credentials: any) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  getProfile: () => apiCall('/auth/me'),
  
  updateProfile: (profileData: any) => 
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// Doctor API calls
export const doctorAPI = {
  getAll: (params = '') => apiCall(`/doctors${params}`),
  
  getById: (id: string) => apiCall(`/doctors/${id}`),
  
  createProfile: (doctorData: any) => 
    apiCall('/doctors/profile', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    }),
  
  updateProfile: (doctorData: any) => 
    apiCall('/doctors/profile', {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    }),
  
  updateAvailability: (availability: any) => 
    apiCall('/doctors/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    }),
  
  getSpecializations: () => apiCall('/doctors/meta/specializations'),
};

// Appointment API calls
export const appointmentAPI = {
  book: (appointmentData: any) => 
    apiCall('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  
  getAll: (params = '') => apiCall(`/appointments${params}`),
  
  getById: (id: string) => apiCall(`/appointments/${id}`),
  
  updateStatus: (id: string, status: string) => 
    apiCall(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  cancel: (id: string, reason: string) => 
    apiCall(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
  
  complete: (id: string, data: any) => 
    apiCall(`/appointments/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getAvailableSlots: (doctorId: string, date: string) => 
    apiCall(`/appointments/doctor/${doctorId}/availability?date=${date}`),
};