import axios from "axios";

const api = axios.create({
  baseURL: "https://dacha.techinfo.uz/api",
  // baseURL:"http://localhost:4000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
        
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(
      error.response?.data || {
        message: "Server bilan bog‘lanishda xatolik",
      }
    );
  }
);

export default api;
