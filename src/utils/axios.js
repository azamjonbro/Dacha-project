import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://dacha.techinfo.uz/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = JSON.parse( localStorage.getItem("token")); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 🚨 RESPONSE INTERCEPTOR
 * Global error handling
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // token eskirgan yoki noto‘g‘ri
      localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(
      error.response?.data || {
        message: "Server bilan bog‘lanishda xatolik",
      }
    );
  }
);

export default api;
