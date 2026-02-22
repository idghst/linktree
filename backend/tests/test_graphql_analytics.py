# 파일 목적: 분석 GraphQL resolver 테스트 (summary, linkStats, viewStats, topLinks, recentClicks)
# 주요 기능: POST /graphql 기반 analytics operation 검증
# 사용 방법: pytest tests/test_graphql_analytics.py

import uuid
from datetime import datetime, date, timezone
from unittest.mock import AsyncMock

import pytest

from app.schemas.analytics import (
    AnalyticsSummary,
    LinkAnalytics,
    ViewStats,
    DailyViewStats,
    TopLink,
    RecentClick,
)


GQL_SUMMARY = """
query {
  summary {
    totalClicks totalViews totalLinks todayClicks todayViews clickThroughRate
  }
}
"""

GQL_LINK_STATS = """
query {
  linkStats {
    id title url clickCount isActive
  }
}
"""

GQL_VIEW_STATS = """
query {
  viewStats(days: 7) {
    days totalViews
    daily { date viewCount uniqueVisitors }
  }
}
"""

GQL_TOP_LINKS = """
query {
  topLinks(limit: 3) {
    id title url clickCount ctr
  }
}
"""

GQL_RECENT_CLICKS = """
query {
  recentClicks(limit: 5) {
    linkId title clickedAt visitorIp
  }
}
"""


class TestGraphQLSummary:
    async def test_summary_success(self, auth_gql_client, mocker):
        """정상 summary 조회"""
        mock_summary = AnalyticsSummary(
            total_clicks=10,
            total_views=100,
            total_links=5,
            today_clicks=2,
            today_views=20,
            click_through_rate=10.0,
        )
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_summary",
            new_callable=AsyncMock,
            return_value=mock_summary,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_SUMMARY})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["summary"]["totalClicks"] == 10
        assert data["data"]["summary"]["totalViews"] == 100
        assert data["data"]["summary"]["clickThroughRate"] == 10.0

    async def test_summary_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_SUMMARY})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLLinkStats:
    async def test_link_stats_success(self, auth_gql_client, mocker):
        """정상 link stats 조회"""
        link_id = uuid.UUID("00000000-0000-0000-0000-000000000002")
        mock_stats = [
            LinkAnalytics(id=link_id, title="Test", url="https://example.com", click_count=5, is_active=True)
        ]
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_link_stats",
            new_callable=AsyncMock,
            return_value=mock_stats,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_LINK_STATS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert len(data["data"]["linkStats"]) == 1
        assert data["data"]["linkStats"][0]["clickCount"] == 5

    async def test_link_stats_empty(self, auth_gql_client, mocker):
        """링크 없음 → 빈 배열"""
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_link_stats",
            new_callable=AsyncMock,
            return_value=[],
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_LINK_STATS})
        data = response.json()

        assert response.status_code == 200
        assert data["data"]["linkStats"] == []


class TestGraphQLViewStats:
    async def test_view_stats_success(self, auth_gql_client, mocker):
        """기본 7일 view stats"""
        today = date.today()
        mock_vs = ViewStats(
            days=7,
            total_views=50,
            daily=[DailyViewStats(date=today, view_count=10, unique_visitors=8)],
        )
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_view_stats",
            new_callable=AsyncMock,
            return_value=mock_vs,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_VIEW_STATS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["viewStats"]["days"] == 7
        assert data["data"]["viewStats"]["totalViews"] == 50
        assert len(data["data"]["viewStats"]["daily"]) == 1

    async def test_view_stats_custom_days(self, auth_gql_client, mocker):
        """30일 view stats"""
        mock_vs = ViewStats(days=30, total_views=200, daily=[])
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_view_stats",
            new_callable=AsyncMock,
            return_value=mock_vs,
        )

        query = "query { viewStats(days: 30) { days totalViews } }"
        response = await auth_gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert data["data"]["viewStats"]["days"] == 30


class TestGraphQLTopLinks:
    async def test_top_links_success(self, auth_gql_client, mocker):
        """top links 조회"""
        link_id = uuid.UUID("00000000-0000-0000-0000-000000000002")
        mock_top = [TopLink(id=link_id, title="Top", url="https://top.com", click_count=100, ctr=5.0)]
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_top_links",
            new_callable=AsyncMock,
            return_value=mock_top,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_TOP_LINKS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["topLinks"][0]["clickCount"] == 100
        assert data["data"]["topLinks"][0]["ctr"] == 5.0


class TestGraphQLRecentClicks:
    async def test_recent_clicks_success(self, auth_gql_client, mocker):
        """recent clicks 조회"""
        link_id = uuid.UUID("00000000-0000-0000-0000-000000000002")
        mock_clicks = [
            RecentClick(
                link_id=link_id,
                title="Test",
                clicked_at=datetime.now(timezone.utc),
                visitor_ip="1.2.3.*",
            )
        ]
        mocker.patch(
            "app.graphql.resolvers.analytics.analytics_service.get_recent_clicks",
            new_callable=AsyncMock,
            return_value=mock_clicks,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_RECENT_CLICKS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert len(data["data"]["recentClicks"]) == 1
        assert data["data"]["recentClicks"][0]["title"] == "Test"

    async def test_recent_clicks_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_RECENT_CLICKS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data
