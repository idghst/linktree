// 파일 목적: 통계 분석 API 호출 함수 모음 (GraphQL 기반)
// 주요 기능: getSummary, getLinkStats, getViewStats, getTopLinks, getRecentClicks API 래퍼
// 사용 방법: import { analyticsService } from "@/services/analytics"

import { gqlRequest } from "@/lib/graphql-client";
import {
  SUMMARY_QUERY,
  LINK_STATS_QUERY,
  VIEW_STATS_QUERY,
  TOP_LINKS_QUERY,
  RECENT_CLICKS_QUERY,
} from "@/graphql/queries/analytics";
import type {
  AnalyticsSummary,
  LinkAnalytics,
  ViewStats,
  TopLink,
  RecentClick,
} from "@/types/api";

function mapSummary(s: Record<string, unknown>): AnalyticsSummary {
  return {
    total_clicks: (s.totalClicks ?? s.total_clicks) as number,
    total_views: (s.totalViews ?? s.total_views) as number,
    total_links: (s.totalLinks ?? s.total_links) as number,
    today_clicks: (s.todayClicks ?? s.today_clicks) as number,
    today_views: (s.todayViews ?? s.today_views) as number,
    click_through_rate: (s.clickThroughRate ?? s.click_through_rate) as number,
  };
}

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const result = await gqlRequest<{ summary: Record<string, unknown> }>(SUMMARY_QUERY);
    return mapSummary(result.summary);
  },

  getLinkStats: async (): Promise<LinkAnalytics[]> => {
    const result = await gqlRequest<{ linkStats: Record<string, unknown>[] }>(LINK_STATS_QUERY);
    return result.linkStats.map((l) => ({
      id: l.id as string,
      title: l.title as string,
      url: l.url as string,
      click_count: (l.clickCount ?? l.click_count) as number,
      is_active: (l.isActive ?? l.is_active) as boolean,
    }));
  },

  getViewStats: async (days: 7 | 30 = 7): Promise<ViewStats> => {
    const result = await gqlRequest<{ viewStats: Record<string, unknown> }>(VIEW_STATS_QUERY, {
      days,
    });
    const vs = result.viewStats;
    const daily = (vs.daily as Record<string, unknown>[]).map((d) => ({
      date: d.date as string,
      view_count: (d.viewCount ?? d.view_count) as number,
      unique_visitors: (d.uniqueVisitors ?? d.unique_visitors) as number,
    }));
    return {
      days: vs.days as number,
      total_views: (vs.totalViews ?? vs.total_views) as number,
      daily,
    };
  },

  getTopLinks: async (limit: number = 5): Promise<TopLink[]> => {
    const result = await gqlRequest<{ topLinks: Record<string, unknown>[] }>(TOP_LINKS_QUERY, {
      limit,
    });
    return result.topLinks.map((l) => ({
      id: l.id as string,
      title: l.title as string,
      url: l.url as string,
      click_count: (l.clickCount ?? l.click_count) as number,
      ctr: l.ctr as number,
    }));
  },

  getRecentClicks: async (limit: number = 10): Promise<RecentClick[]> => {
    const result = await gqlRequest<{ recentClicks: Record<string, unknown>[] }>(
      RECENT_CLICKS_QUERY,
      { limit }
    );
    return result.recentClicks.map((c) => ({
      link_id: (c.linkId ?? c.link_id) as string,
      title: c.title as string,
      clicked_at: (c.clickedAt ?? c.clicked_at) as string,
      visitor_ip: (c.visitorIp ?? c.visitor_ip) as string | null,
    }));
  },
};
