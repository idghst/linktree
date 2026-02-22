// 파일 목적: 인증 API 호출 함수 모음 (GraphQL 기반)
// 주요 기능: register, login, getMe, refresh, changePassword, deleteAccount API 래퍼
// 사용 방법: import { authService } from "@/services/auth"

import { gqlRequest } from "@/lib/graphql-client";
import {
  REGISTER_MUTATION,
  LOGIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  DELETE_ACCOUNT_MUTATION,
} from "@/graphql/mutations/auth";
import { ME_QUERY } from "@/graphql/queries/auth";
import type { User, RegisterRequest, LoginRequest, TokenResponse } from "@/types/api";

function mapUser(u: Record<string, unknown>): User {
  return {
    id: u.id as string,
    username: u.username as string,
    email: u.email as string,
    display_name: (u.displayName ?? u.display_name) as string | null,
    bio: u.bio as string | null,
    avatar_url: (u.avatarUrl ?? u.avatar_url) as string | null,
    theme: u.theme as string,
    bg_color: (u.bgColor ?? u.bg_color) as string,
    is_active: (u.isActive ?? u.is_active) as boolean,
    created_at: (u.createdAt ?? u.created_at) as string,
    updated_at: (u.updatedAt ?? u.updated_at) as string,
  };
}

function mapToken(t: Record<string, unknown>): TokenResponse {
  return {
    access_token: (t.accessToken ?? t.access_token) as string,
    refresh_token: (t.refreshToken ?? t.refresh_token) as string,
    token_type: (t.tokenType ?? t.token_type) as string,
  };
}

export const authService = {
  register: async (data: RegisterRequest): Promise<User> => {
    const result = await gqlRequest<{ register: Record<string, unknown> }>(
      REGISTER_MUTATION,
      { input: data },
      true
    );
    return mapUser(result.register);
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const result = await gqlRequest<{ login: Record<string, unknown> }>(
      LOGIN_MUTATION,
      { input: data },
      true
    );
    return mapToken(result.login);
  },

  getMe: async (): Promise<User> => {
    const result = await gqlRequest<{ me: Record<string, unknown> }>(ME_QUERY);
    return mapUser(result.me);
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const result = await gqlRequest<{ refreshToken: Record<string, unknown> }>(
      REFRESH_TOKEN_MUTATION,
      { input: { refreshToken } },
      true
    );
    return mapToken(result.refreshToken);
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }): Promise<void> => {
    await gqlRequest<{ changePassword: boolean }>(CHANGE_PASSWORD_MUTATION, {
      input: {
        currentPassword: data.current_password,
        newPassword: data.new_password,
      },
    });
  },

  deleteAccount: async (): Promise<void> => {
    await gqlRequest<{ deleteAccount: boolean }>(DELETE_ACCOUNT_MUTATION);
  },
};
