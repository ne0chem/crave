import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { authApi, getUserFromToken } from "../api/auth/auth";
import { LoginCredentials, AuthState, User } from "../types/auth.types";

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
      } catch (e) {
        console.error("Ошибка парсинга пользователя:", e);
      }
    } else if (token) {
      user = getUserFromToken(token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return {
      user: user,
      token: token,
      isLoading: false,
      error: null,
    };
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);

      if (!response.token) {
        throw new Error("Токен не получен");
      }

      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Ошибка входа";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");

    authApi.logout();

    setState({ user: null, token: null, isLoading: false, error: null });
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
