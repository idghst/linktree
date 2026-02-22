# 파일 목적: 분석/통계 GraphQL resolver (Query만)
# 주요 기능: summary, linkStats, viewStats, topLinks, recentClicks
# 사용 방법: AnalyticsQuery를 schema.py에서 조합

import uuid
import strawberry
from strawberry.types import Info

from app.graphql.context import GraphQLContext
from app.graphql.types.analytics import (
    AnalyticsSummaryType,
    LinkAnalyticsType,
    ViewStatsType,
    DailyViewStatsType,
    TopLinkType,
    RecentClickType,
)
from app.services import analytics as analytics_service


def _require_auth(info: Info) -> uuid.UUID:
    if info.context.user_id is None:
        raise strawberry.exceptions.GraphQLError("인증이 필요합니다.")
    return info.context.user_id


@strawberry.type
class AnalyticsQuery:
    @strawberry.field
    async def summary(self, info: Info[GraphQLContext, None]) -> AnalyticsSummaryType:
        user_id = _require_auth(info)
        result = await analytics_service.get_summary(info.context.db, user_id)
        return AnalyticsSummaryType(
            total_clicks=result.total_clicks,
            total_views=result.total_views,
            total_links=result.total_links,
            today_clicks=result.today_clicks,
            today_views=result.today_views,
            click_through_rate=result.click_through_rate,
        )

    @strawberry.field
    async def link_stats(self, info: Info[GraphQLContext, None]) -> list[LinkAnalyticsType]:
        user_id = _require_auth(info)
        results = await analytics_service.get_link_stats(info.context.db, user_id)
        return [
            LinkAnalyticsType(
                id=r.id,
                title=r.title,
                url=r.url,
                click_count=r.click_count,
                is_active=r.is_active,
            )
            for r in results
        ]

    @strawberry.field
    async def view_stats(self, info: Info[GraphQLContext, None], days: int = 7) -> ViewStatsType:
        user_id = _require_auth(info)
        result = await analytics_service.get_view_stats(info.context.db, user_id, days)
        daily = [
            DailyViewStatsType(
                date=d.date,
                view_count=d.view_count,
                unique_visitors=d.unique_visitors,
            )
            for d in result.daily
        ]
        return ViewStatsType(days=result.days, total_views=result.total_views, daily=daily)

    @strawberry.field
    async def top_links(self, info: Info[GraphQLContext, None], limit: int = 5) -> list[TopLinkType]:
        user_id = _require_auth(info)
        results = await analytics_service.get_top_links(info.context.db, user_id, limit)
        return [
            TopLinkType(
                id=r.id,
                title=r.title,
                url=r.url,
                click_count=r.click_count,
                ctr=r.ctr,
            )
            for r in results
        ]

    @strawberry.field
    async def recent_clicks(
        self, info: Info[GraphQLContext, None], limit: int = 10
    ) -> list[RecentClickType]:
        user_id = _require_auth(info)
        results = await analytics_service.get_recent_clicks(info.context.db, user_id, limit)
        return [
            RecentClickType(
                link_id=r.link_id,
                title=r.title,
                clicked_at=r.clicked_at,
                visitor_ip=r.visitor_ip,
            )
            for r in results
        ]
