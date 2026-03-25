import axios from "axios";
import { API_URL } from "./api";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Токен добавлен в заголовок");
    } else {
      console.log("⚠️ Токен отсутствует");
    }
    console.log(
      `📡 ${config.method?.toUpperCase()} запрос: ${config.baseURL}${config.url}`,
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Ответ: ${response.config.url} - статус: ${response.status}`,
    );
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - перенаправление на логин");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    console.error(
      `❌ Ошибка запроса: ${error.config?.url}`,
      error.response?.status,
    );
    return Promise.reject(error);
  },
);
