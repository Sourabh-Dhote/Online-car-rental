const API_BASE_URL = 'https://online-car-rental-backend.onrender.com/api';

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Stringify body if it exists and is not already a string
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw new Error(error.message || 'API request failed');
  }
};

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const data: LoginData = { email, password };
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  register: async (name: string, email: string, password: string, role = 'user') => {
    const data: RegisterData = { name, email, password, role };
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  activateAdmin: async () => {
    return apiRequest('/admin/activate', {
      method: 'POST',
    });
  }
};

// Cars API
export const carsAPI = {
  getAll: () => apiRequest('/cars'),
  
  getById: (id: string) => apiRequest(`/cars/${id}`),
  
  create: (carData: any) => apiRequest('/cars', {
    method: 'POST',
    body: JSON.stringify(carData),
  }),
  
  update: (id: string, carData: any) => apiRequest(`/cars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(carData),
  }),
  
  delete: (id: string) => apiRequest(`/cars/${id}`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData) => {
    return apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },
  getAll: async () => {
    return apiRequest("/bookings");
  },
  getById: async (id) => {
    return apiRequest(`/bookings/${id}`);
  },
  update: async (id, bookingData) => {
    return apiRequest(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    });
  },
  delete: async (id) => {
    return apiRequest(`/bookings/${id}`, {
      method: "DELETE",
    });
  },
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  
  update: (id: string, userData: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};
