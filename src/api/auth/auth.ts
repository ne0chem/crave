// api/auth/auth.ts
import { apiClient } from "./client";
import { LoginCredentials, LoginResponse, User } from "../../types/auth.types";

console.log("📁 Auth API модуль загружен");

const decodeToken = (token: string): any => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log("🔓 Декодированный payload:", payload);
      return payload;
    }
  } catch (e) {
    console.error("Ошибка декодирования токена:", e);
  }
  return null;
};

export const getUserFromToken = (token: string): User | null => {
  const payload = decodeToken(token);
  if (payload) {
    return {
      id: payload.id || payload.user_id || payload.sub,
      login: payload.login || payload.username || payload.email,
      role: payload.role || "user",
      name: payload.name || payload.login || payload.username,
    };
  }
  return null;
};

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    console.log("🔐 Попытка входа:", credentials.login);

    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/login",
        credentials,
      );

      console.log("✅ Успешный ответ от /login:", response.data);

      const token = response.data.token || response.data.access_token;
      if (!token) {
        throw new Error("Токен не получен от сервера");
      }

      localStorage.setItem("token", token);
      console.log("🔑 Токен сохранен в localStorage");

      const user = getUserFromToken(token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role) {
          localStorage.setItem("userRole", user.role);
        }
        console.log("👤 Пользователь из токена:", user);
      }

      return {
        token: token,
        user: user,
      };
    } catch (error: any) {
      console.error("❌ Ошибка в login API:");

      if (error.response) {
        console.error("  Статус:", error.response.status);
        console.error("  Данные ошибки:", error.response.data);
        const errorMessage =
          error.response.data?.message ||
          `Ошибка сервера: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("  Нет ответа от сервера");
        throw new Error("Сервер не отвечает");
      } else {
        console.error("  Ошибка:", error.message);
        throw error;
      }
    }
  },

  logout: () => {
    console.log("🚪 Выход из системы");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    if (token) {
      return getUserFromToken(token);
    }
    return null;
  },
};
