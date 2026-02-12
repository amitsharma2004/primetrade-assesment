export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  login: (credentials: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}
