import axios from "axios";

const api = axios.create({
  baseURL: "https://dacha.techinfo.uz/api",
  // baseURL:"http://localhost:4000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* REQUEST INTERCEPTOR */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

/* RESPONSE INTERCEPTOR */
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login"; // 🔥 auto redirect
    }

    return Promise.reject(
      err.response?.data || { message: "Server error" }
    );
  }
);

export default api;
