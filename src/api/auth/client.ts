import axios from "axios";

// ВРЕМЕННО используем прямой URL как в старом коде
const API_URL = "http://88.210.52.152:8081/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // как в старом коде
});
// Логируем каждый запрос
apiClient.interceptors.request.use(
  (config) => {
    console.log("📤 Исходящий запрос:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers,
    });

    const token = localStorage.getItem("token");
    console.log("🔑 Токен из localStorage:", token ? "есть" : "нет");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Токен добавлен в заголовки");
    }

    return config;
  },
  (error) => {
    console.error("❌ Ошибка в запросе:", error);
    return Promise.reject(error);
  },
);

// Логируем каждый ответ
apiClient.interceptors.response.use(
  (response) => {
    console.log("📥 Ответ получен:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ Ошибка ответа:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response?.status === 401) {
      console.warn("⚠️ Токен невалиден, очищаем localStorage");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
