// api/auth/auth.ts
import { apiClient } from "./client";
import { LoginCredentials, LoginResponse, User } from "../../types/auth.types";

const decodeToken = (token: string): any => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
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
      // token не включаем в объект User
    };
  }
  return null;
};

export const authApi = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<{ token: string; user: User | null }> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/login",
        credentials,
      );

      const token = response.data.token || response.data.access_token;
      if (!token) {
        throw new Error("Токен не получен от сервера");
      }

      localStorage.setItem("token", token);

      const user = getUserFromToken(token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role) {
          localStorage.setItem("userRole", user.role);
        }
      }

      return {
        token: token,
        user: user,
      };
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          `Ошибка сервера: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("Сервер не отвечает");
      } else {
        throw error;
      }
    }
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem("token");
    if (token) {
      return getUserFromToken(token);
    }
    return null;
  },
};
