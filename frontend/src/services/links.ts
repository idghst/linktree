// 파일 목적: 링크 관리 API 호출 함수 모음 (GraphQL 기반)
// 주요 기능: getLinks, createLink, updateLink, deleteLink, reorderLinks, toggleLink
// 사용 방법: import { linksService } from "@/services/links"

import { gqlRequest, GqlError } from "@/lib/graphql-client";
import {
  CREATE_LINK_MUTATION,
  UPDATE_LINK_MUTATION,
  DELETE_LINK_MUTATION,
  REORDER_LINKS_MUTATION,
  TOGGLE_LINK_MUTATION,
} from "@/graphql/mutations/links";
import { LINKS_QUERY } from "@/graphql/queries/links";
import type { Link, CreateLinkRequest, UpdateLinkRequest, ReorderItem } from "@/types/api";

function mapLink(l: Record<string, unknown>): Link {
  return {
    id: l.id as string,
    user_id: (l.userId ?? l.user_id) as string,
    title: l.title as string,
    url: l.url as string,
    description: l.description as string | null,
    thumbnail_url: (l.thumbnailUrl ?? l.thumbnail_url) as string | null,
    favicon_url: (l.faviconUrl ?? l.favicon_url) as string | null,
    position: l.position as number,
    is_active: (l.isActive ?? l.is_active) as boolean,
    click_count: (l.clickCount ?? l.click_count) as number,
    scheduled_start: (l.scheduledStart ?? l.scheduled_start) as string | null,
    scheduled_end: (l.scheduledEnd ?? l.scheduled_end) as string | null,
    is_sensitive: (l.isSensitive ?? l.is_sensitive) as boolean,
    link_type: (l.linkType ?? l.link_type) as "link" | "header",
    created_at: (l.createdAt ?? l.created_at) as string,
    updated_at: (l.updatedAt ?? l.updated_at) as string,
  };
}

export const linksService = {
  getLinks: async (): Promise<Link[]> => {
    try {
      const result = await gqlRequest<{ links: Record<string, unknown>[] }>(LINKS_QUERY);
      return result.links.map(mapLink);
    } catch (err) {
      if (err instanceof GqlError) throw err;
      throw new GqlError(0, "링크 목록을 불러오는데 실패했습니다.");
    }
  },

  createLink: async (data: CreateLinkRequest): Promise<Link> => {
    try {
      const result = await gqlRequest<{ createLink: Record<string, unknown> }>(
        CREATE_LINK_MUTATION,
        { input: data }
      );
      return mapLink(result.createLink);
    } catch (err) {
      if (err instanceof GqlError) throw err;
      throw new GqlError(0, "링크 생성에 실패했습니다.");
    }
  },

  updateLink: async (id: string, data: UpdateLinkRequest): Promise<Link> => {
    try {
      const result = await gqlRequest<{ updateLink: Record<string, unknown> }>(
        UPDATE_LINK_MUTATION,
        { linkId: id, input: data }
      );
      return mapLink(result.updateLink);
    } catch (err) {
      if (err instanceof GqlError) throw err;
      throw new GqlError(0, "링크 수정에 실패했습니다.");
    }
  },

  deleteLink: async (id: string): Promise<void> => {
    try {
      await gqlRequest<{ deleteLink: boolean }>(DELETE_LINK_MUTATION, { linkId: id });
    } catch (err) {
      if (err instanceof GqlError) throw err;
      throw new GqlError(0, "링크 삭제에 실패했습니다.");
    }
  },

  reorderLinks: async (items: ReorderItem[]): Promise<Link[]> => {
    try {
      const result = await gqlRequest<{ reorderLinks: Record<string, unknown>[] }>(
        REORDER_LINKS_MUTATION,
        { items }
      );
      return result.reorderLinks.map(mapLink);
    } catch (err) {
      if (err instanceof GqlError) throw err;
      throw new GqlError(0, "링크 순서 변경에 실패했습니다.");
    }
  },

  toggleLink: async (id: string): Promise<Link> => {
    try {
      const result = await gqlRequest<{ toggleLink: Record<string, unknown> }>(
        TOGGLE_LINK_MUTATION,
        { linkId: id }
      );
      return mapLink(result.toggleLink);
    } catch (err) {
      if (err instanceof GqlError) throw err;
      throw new GqlError(0, "링크 상태 변경에 실패했습니다.");
    }
  },
};
