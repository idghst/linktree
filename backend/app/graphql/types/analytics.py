# 파일 목적: 분석/통계 관련 GraphQL 타입 정의
# 주요 기능: AnalyticsSummaryType, LinkAnalyticsType, ViewStatsType, DailyViewStatsType, TopLinkType, RecentClickType
# 사용 방법: from app.graphql.types.analytics import AnalyticsSummaryType

import uuid
import strawberry
from datetime import date, datetime


@strawberry.type
class AnalyticsSummaryType:
    total_clicks: int
    total_views: int
    total_links: int
    today_clicks: int
    today_views: int
    click_through_rate: float


@strawberry.type
class LinkAnalyticsType:
    id: uuid.UUID
    title: str
    url: str
    click_count: int
    is_active: bool


@strawberry.type
class DailyViewStatsType:
    date: date
    view_count: int
    unique_visitors: int


@strawberry.type
class ViewStatsType:
    days: int
    total_views: int
    daily: list[DailyViewStatsType]


@strawberry.type
class TopLinkType:
    id: uuid.UUID
    title: str
    url: str
    click_count: int
    ctr: float


@strawberry.type
class RecentClickType:
    link_id: uuid.UUID
    title: str
    clicked_at: datetime
    visitor_ip: str | None
