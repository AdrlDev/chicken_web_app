// types/auth.ts
export interface UserOut {
  id: number;
  email: string;
  accountType: string;
  createdAt: string; // ISO format string
}

export interface AuthHook {
  user: UserOut | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, accountType?: string) => Promise<UserOut | null>;
  logout: () => void;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}