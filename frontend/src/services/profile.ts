// 파일 목적: 프로필 관련 API 호출 함수 모음 (GraphQL 기반)
// 주요 기능: getMyProfile, updateProfile, getPublicProfile, recordView API 래퍼
// 사용 방법: import { profileService } from "@/services/profile"

import { gqlRequest } from "@/lib/graphql-client";
import { MY_PROFILE_QUERY } from "@/graphql/queries/profile";
import { UPDATE_PROFILE_MUTATION } from "@/graphql/mutations/profile";
import type { User, PublicProfile, UpdateProfileRequest } from "@/types/api";

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

export const profileService = {
  getMyProfile: async (): Promise<User> => {
    const result = await gqlRequest<{ myProfile: Record<string, unknown> }>(MY_PROFILE_QUERY);
    return mapUser(result.myProfile);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const result = await gqlRequest<{ updateProfile: Record<string, unknown> }>(
      UPDATE_PROFILE_MUTATION,
      { input: data }
    );
    return mapUser(result.updateProfile);
  },

  getPublicProfile: (username: string): Promise<PublicProfile> =>
    fetch(`/api/public/${username}`, {
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json()),

  recordView: (username: string): void => {
    fetch(`/api/public/${username}/view`, { method: "POST" }).catch(() => {});
  },
};
