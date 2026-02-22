// 파일 목적: 전역 인증 상태 Context - /api/auth/me를 앱 전체에서 단 1회 호출
// 주요 기능: AuthProvider(루트에 마운트), useAuth 훅(context에서 읽기), auth:logout 이벤트 처리
// 사용 방법: <AuthProvider>{children}</AuthProvider>, const { user } = useAuth()

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { User, LoginRequest, RegisterRequest } from "@/types/api";
import { STORAGE_KEYS, ROUTES } from "@/lib/constants";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    document.cookie = "lt_logged_in=; path=/; max-age=0";
    setUser(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  const fetchMe = useCallback(async () => {
    /* c8 ignore start */
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        : null;
    /* c8 ignore stop */
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      document.cookie = "lt_logged_in=; path=/; max-age=0";
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // graphql-client에서 발행하는 auth:logout 이벤트 수신 (refresh 실패 시)
  useEffect(() => {
    const handleAuthLogout = () => {
      document.cookie = "lt_logged_in=; path=/; max-age=0";
      setUser(null);
      router.push(ROUTES.LOGIN);
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const token = await authService.login(data);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refresh_token);
      document.cookie = "lt_logged_in=1; path=/; max-age=2592000";
      await fetchMe();
      router.push(ROUTES.DASHBOARD);
    },
    [fetchMe, router]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await authService.register(data);
      // 회원가입 성공 후 자동 로그인
      const token = await authService.login({ email: data.email, password: data.password });
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refresh_token);
      document.cookie = "lt_logged_in=1; path=/; max-age=2592000";
      await fetchMe();
      router.push(ROUTES.DASHBOARD);
    },
    [fetchMe, router]
  );

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
