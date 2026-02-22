# 파일 목적: 분석/통계 관련 Pydantic 응답 스키마 정의
# 주요 기능: AnalyticsSummary, LinkAnalytics, ViewStats, DailyViewStats, TopLink, RecentClick
# 사용 방법: from app.schemas.analytics import AnalyticsSummary, ViewStats, TopLink, RecentClick

import uuid
from datetime import date, datetime
from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_clicks: int
    total_views: int
    total_links: int
    today_clicks: int
    today_views: int
    click_through_rate: float


class LinkAnalytics(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    url: str
    click_count: int
    is_active: bool


class DailyViewStats(BaseModel):
    date: date
    view_count: int
    unique_visitors: int


class ViewStats(BaseModel):
    days: int
    total_views: int
    daily: list[DailyViewStats]


class TopLink(BaseModel):
    id: uuid.UUID
    title: str
    url: str
    click_count: int
    ctr: float


class RecentClick(BaseModel):
    link_id: uuid.UUID
    title: str
    clicked_at: datetime
    visitor_ip: str | None
