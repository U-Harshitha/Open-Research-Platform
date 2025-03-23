import axios from "axios";

const API_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post("/login", { user: { email, password } });
    const token = response.headers.authorization;
    if (token) {
      localStorage.setItem("token", token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (email, password) => {
  try {
    const response = await api.post("/signup", { user: { email, password } });
    const token = response.headers.authorization;
    if (token) {
      localStorage.setItem("token", token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.delete("/logout");
    localStorage.removeItem("token");
  } catch (error) {
    throw error;
  }
};

export const fetchResearchPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/research_papers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching research papers:", error);
    return [];
  }
};
