// 파일 목적: 분석 관련 GraphQL Query 문자열 정의
// 주요 기능: SUMMARY_QUERY, LINK_STATS_QUERY, VIEW_STATS_QUERY, TOP_LINKS_QUERY, RECENT_CLICKS_QUERY
// 사용 방법: import { SUMMARY_QUERY } from "@/graphql/queries/analytics"

export const SUMMARY_QUERY = `
  query Summary {
    summary {
      totalClicks
      totalViews
      totalLinks
      todayClicks
      todayViews
      clickThroughRate
    }
  }
`;

export const LINK_STATS_QUERY = `
  query LinkStats {
    linkStats {
      id
      title
      url
      clickCount
      isActive
    }
  }
`;

export const VIEW_STATS_QUERY = `
  query ViewStats($days: Int) {
    viewStats(days: $days) {
      days
      totalViews
      daily {
        date
        viewCount
        uniqueVisitors
      }
    }
  }
`;

export const TOP_LINKS_QUERY = `
  query TopLinks($limit: Int) {
    topLinks(limit: $limit) {
      id
      title
      url
      clickCount
      ctr
    }
  }
`;

export const RECENT_CLICKS_QUERY = `
  query RecentClicks($limit: Int) {
    recentClicks(limit: $limit) {
      linkId
      title
      clickedAt
      visitorIp
    }
  }
`;
