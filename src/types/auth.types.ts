// types/auth.types.ts
export interface LoginCredentials {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    // убираем '?'
    id: string;
    name: string;
    login: string;
    role?: string; // role может и не быть, это ок
  };
}

export interface AuthState {
  user: LoginResponse["user"] | null; // теперь работает!
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
