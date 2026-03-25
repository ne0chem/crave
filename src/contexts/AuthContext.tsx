import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, getUserFromToken } from "../api/auth/auth";
import { LoginCredentials, AuthState, User } from "../types/auth.types";

console.log("📁 AuthContext модуль загружен");

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    let user: User | null = null;

    if (savedUser) {
      try {
        user = JSON.parse(savedUser);
        console.log("📦 Загружен пользователь из localStorage:", user);
      } catch (e) {
        console.error("Ошибка парсинга пользователя:", e);
      }
    } else if (token) {
      user = getUserFromToken(token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        console.log("🔓 Пользователь декодирован из токена:", user);
      }
    }

    return {
      user: user,
      token: token,
      isLoading: false,
      error: null,
    };
  });

  console.log("📊 Начальное состояние:", {
    token: state.token ? "есть" : "нет",
    user: state.user ? state.user.login : "нет",
    role: state.user?.role || "нет",
    isLoading: state.isLoading,
  });

  const login = async (credentials: LoginCredentials) => {
    console.log("🔐 login вызван");

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);
      console.log("📦 Ответ от authApi.login:", response);

      if (!response.token) {
        throw new Error("Токен не получен");
      }

      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });

      console.log(
        "✅ Состояние обновлено, пользователь авторизован:",
        response.user,
      );
    } catch (error: any) {
      const errorMessage = error.message || "Ошибка входа";
      console.error("❌ Ошибка входа:", errorMessage);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 logout вызван");

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");

    authApi.logout();

    setState({ user: null, token: null, isLoading: false, error: null });

    console.log("✅ Выход выполнен");
  };

  console.log("🔄 Рендер AuthProvider, состояние:", {
    hasUser: !!state.user,
    userLogin: state.user?.login,
    userRole: state.user?.role,
    hasToken: !!state.token,
    isLoading: state.isLoading,
    hasError: !!state.error,
  });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
