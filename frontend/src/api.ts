const BASE_URL = "/api";
const apiRequest = async (endpoint: string, method: string, body?: any) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error: any) {
    console.error("API request error:", error);
    throw error;
  }
};

export const authAPI = {
  register: (name: string, email: string, password: string, role = "user") =>
    apiRequest("/auth/register", "POST", {
      name,
      email,
      password,
      role,
    }),

  login: (email: string, password: string) =>
    apiRequest("/auth/login", "POST", {
      email,
      password,
    }),
};