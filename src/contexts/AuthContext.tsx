// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth/auth";
import { LoginCredentials, AuthState } from "../types/auth.types";
import { useDevAuth } from "../useDevAuth"; // 👈 Импортируем хук

console.log("📁 AuthContext модуль загружен");

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const devMode = useDevAuth(); // 👈 Используем хук

  // Инициализация состояния с учетом devMode
  const [state, setState] = useState<AuthState>(() => {
    // Если devMode включен - сразу создаем тестового пользователя
    if (devMode) {
      console.log("🧪 DevMode: создаем тестового пользователя");
      return {
        user: {
          id: "dev-user-123",
          name: "Тестовый Пользователь",
          login: "dev@test.ru",
          role: "admin",
        },
        token: "dev-token-12345",
        isLoading: false,
        error: null,
      };
    }

    // Обычный режим - берем из localStorage
    return {
      user: null,
      token: localStorage.getItem("token"),
      isLoading: true,
      error: null,
    };
  });

  console.log("📊 Начальное состояние:", {
    token: state.token ? "есть" : "нет",
    isLoading: state.isLoading,
    devMode: devMode,
  });

  // Проверка авторизации только для обычного режима
  useEffect(() => {
    // В devMode ничего не проверяем
    if (devMode) {
      console.log("🧪 DevMode: пропускаем проверку авторизации");
      return;
    }

    console.log("🔄 useEffect: проверка авторизации");

    const checkAuth = async () => {
      console.log("🔍 checkAuth вызван, токен:", state.token ? "есть" : "нет");

      if (state.token) {
        try {
          console.log("👤 Запрос данных пользователя по токену");
          const user = await authApi.getCurrentUser();
          console.log("✅ Пользователь загружен:", user);
          setState((prev) => ({ ...prev, user, isLoading: false }));
        } catch (error) {
          console.error("❌ Ошибка проверки токена:", error);
          localStorage.removeItem("token");
          setState({ user: null, token: null, isLoading: false, error: null });
        }
      } else {
        console.log("⏭️ Нет токена, пропускаем проверку");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, [state.token, devMode]); // 👈 Добавили devMode в зависимости

  const login = async (credentials: LoginCredentials) => {
    console.log("🔐 login вызван");

    // В devMode имитируем успешный вход
    if (devMode) {
      console.log("🧪 DevMode: имитация входа");
      setState({
        user: {
          id: "dev-user-123",
          name: "Тестовый Пользователь",
          login: credentials.login,
          role: "admin",
        },
        token: "dev-token-12345",
        isLoading: false,
        error: null,
      });
      return;
    }

    // Обычный режим - реальный API
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);
      localStorage.setItem("token", response.token);
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Ошибка входа";
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

    // В devMode просто очищаем состояние
    if (devMode) {
      setState({ user: null, token: null, isLoading: false, error: null });
      return;
    }

    // Обычный режим - вызываем API и очищаем
    authApi.logout();
    setState({ user: null, token: null, isLoading: false, error: null });
  };

  console.log("🔄 Рендер AuthProvider, состояние:", {
    hasUser: !!state.user,
    hasToken: !!state.token,
    isLoading: state.isLoading,
    hasError: !!state.error,
    devMode: devMode,
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
