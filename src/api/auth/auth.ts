import { apiClient } from "./client";
import { LoginCredentials, LoginResponse } from "../../types/auth.types";

console.log("📁 Auth API модуль загружен");

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    console.log("🔐 Попытка входа:", credentials);

    try {
      console.log("📡 Отправка запроса на /login");

      const response = await apiClient.post<LoginResponse>(
        "/login",
        credentials,
      );

      console.log("✅ Успешный ответ от /login:", response.data);

      // Проверяем наличие токена (как в старом коде)
      if (!response.data.token) {
        throw new Error("Токен не получен от сервера");
      }

      // Сохраняем токен
      localStorage.setItem("token", response.data.token);
      console.log("🔑 Токен сохранен в localStorage");

      // Декодируем токен для получения роли (как в старом коде)
      try {
        const tokenParts = response.data.token.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userRole = payload.role || "user";
          localStorage.setItem("userRole", userRole);
          console.log("👤 Роль пользователя:", userRole);
        }
      } catch (e) {
        console.error("Ошибка декодирования токена:", e);
      }

      return response.data;
    } catch (error: any) {
      // Улучшенная обработка ошибок как в старом коде
      console.error("❌ Ошибка в login API:");

      if (error.response) {
        // Сервер ответил с ошибкой
        console.error("  Статус:", error.response.status);
        console.error("  Данные ошибки:", error.response.data);

        // Извлекаем сообщение об ошибке как в старом коде
        const errorMessage =
          error.response.data?.message ||
          `Ошибка сервера: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Запрос был отправлен, но нет ответа
        console.error("  Нет ответа от сервера");
        throw new Error("Сервер не отвечает");
      } else {
        // Ошибка при настройке запроса
        console.error("  Ошибка:", error.message);
        throw error;
      }
    }
  },

  logout: () => {
    console.log("🚪 Выход из системы");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
  },

  getCurrentUser: async () => {
    console.log("👤 Запрос текущего пользователя");
    try {
      const response = await apiClient.get("/me");
      return response.data;
    } catch (error) {
      console.error("❌ Ошибка получения пользователя:", error);
      throw error;
    }
  },
};
