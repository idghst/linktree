// 파일 목적: 애플리케이션 전역 상수 정의
// 주요 기능: API_BASE_URL, STORAGE_KEYS, 라우트 상수
// 사용 방법: import { STORAGE_KEYS, ROUTES } from "@/lib/constants"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "lt_access_token",
  REFRESH_TOKEN: "lt_refresh_token",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  DASHBOARD_LINKS: "/dashboard/links",
  DASHBOARD_PROFILE: "/dashboard/profile",
  DASHBOARD_SETTINGS: "/dashboard/settings",
} as const;
