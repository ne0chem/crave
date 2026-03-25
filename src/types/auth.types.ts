export interface LoginCredentials {
  login: string;
  password: string;
}

export interface User {
  id: string;
  login: string;
  role: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  access_token?: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
