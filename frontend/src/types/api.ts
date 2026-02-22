// 파일 목적: 백엔드 API와 일치하는 TypeScript 타입 정의
// 주요 기능: User, Link, Token, Analytics 관련 모든 타입 export
// 사용 방법: import type { User, Link, TokenResponse } from "@/types/api"

export interface SocialLinks {
  github?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
}

export interface SeoSettings {
  title?: string;
  description?: string;
  og_image?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  bg_color: string;
  social_links?: SocialLinks | null;
  seo_settings?: SeoSettings | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description?: string | null;
  thumbnail_url?: string | null;
  favicon_url?: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
  scheduled_start?: string | null;  // ISO 8601
  scheduled_end?: string | null;    // ISO 8601
  is_sensitive?: boolean;
  link_type?: 'link' | 'header';
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PublicProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  bg_color: string;
  social_links?: SocialLinks | null;
  seo_settings?: SeoSettings | null;
  links: Link[];
}

export interface AnalyticsSummary {
  total_clicks: number;
  total_views: number;
  total_links: number;
  today_clicks: number;
  today_views: number;
  click_through_rate: number;
}

export interface TopLink {
  id: string;
  title: string;
  url: string;
  click_count: number;
  ctr: number;
}

export interface RecentClick {
  link_id: string;
  title: string;
  clicked_at: string;
  visitor_ip?: string | null;
}

export interface LinkAnalytics {
  id: string;
  title: string;
  url: string;
  click_count: number;
  is_active: boolean;
}

export interface DailyViewStats {
  date: string;
  view_count: number;
  unique_visitors: number;
}

export interface ViewStats {
  days: number;
  total_views: number;
  daily: DailyViewStats[];
}

export interface CreateLinkRequest {
  title: string;
  url: string;
  description?: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  is_sensitive?: boolean;
  link_type?: 'link' | 'header';
}

export interface UpdateLinkRequest {
  title?: string;
  url?: string;
  description?: string;
  is_active?: boolean;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  is_sensitive?: boolean;
  link_type?: 'link' | 'header';
}

export interface ReorderItem {
  id: string;
  position: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  theme?: string;
  bg_color?: string;
  social_links?: SocialLinks | null;
  seo_settings?: SeoSettings | null;
}

export interface ApiError {
  detail: string;
}
