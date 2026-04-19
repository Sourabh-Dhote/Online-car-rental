const BASE_URL = "/api";
// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`; // ✅ FIX 1: was `${API_BASE_URL}${endpoint}` — undefined!

  const token = localStorage.getItem("token");

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // ✅ FIX 4: Attach JWT token automatically so protected routes work
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "API request failed" }));
      throw new Error(error.message || "API request failed");
    }
    return response.json();
  } catch (error: any) {
    console.error("API request error:", error);
    throw new Error(error.message || "API request failed");
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
  phone?: string; // ✅ FIX 2: Added phone field (Register.tsx sends it)
  role?: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const data: LoginData = { email, password };
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // ✅ FIX 5: Save token to localStorage after login/register
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    return response;
  },

  // ✅ FIX 2: Changed signature from (name, email, password, role) to accept an object
  // Register.tsx calls: authAPI.register({ name, email, password, phone })
  register: async (userData: RegisterData) => {
    const data: RegisterData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
      role: userData.role || "user",
    };
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // ✅ FIX 5: Save token to localStorage after registration
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  activateAdmin: async () => {
    return apiRequest("/admin/activate", { method: "POST" });
  },
};

// Cars API
export const carsAPI = {
  getAll: () => apiRequest("/cars"),
  getById: (id: string) => apiRequest(`/cars/${id}`),
  create: (carData: any) =>
    apiRequest("/cars", { method: "POST", body: JSON.stringify(carData) }),
  update: (id: string, carData: any) =>
    apiRequest(`/cars/${id}`, { method: "PUT", body: JSON.stringify(carData) }),
  delete: (id: string) => apiRequest(`/cars/${id}`, { method: "DELETE" }),
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData: any) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    }),
  getAll: () => apiRequest("/bookings"),
  getById: (id: string) => apiRequest(`/bookings/${id}`),
  update: (id: string, bookingData: any) =>
    apiRequest(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    }),
  delete: (id: string) => apiRequest(`/bookings/${id}`, { method: "DELETE" }),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest("/users"),
  update: (id: string, userData: any) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
};

// ✅ FIX 3: Export BASE_URL as default so authService.ts import works
export default BASE_URL;