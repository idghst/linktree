# 파일 목적: 통계 데이터 조회 비즈니스 로직
# 주요 기능: get_summary(총합계+오늘+CTR), get_link_stats(링크별), get_view_stats(기간별+unique), get_top_links, get_recent_clicks
# 사용 방법: from app.services.analytics import get_summary, get_view_stats, get_top_links, get_recent_clicks

import uuid
from datetime import datetime, timedelta, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date, distinct
from app.models.link import Link
from app.models.analytics import ProfileView, LinkClick
from app.schemas.analytics import (
    AnalyticsSummary,
    LinkAnalytics,
    ViewStats,
    DailyViewStats,
    TopLink,
    RecentClick,
)

async def get_summary(db: AsyncSession, user_id: uuid.UUID) -> AnalyticsSummary:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # 총 클릭 수 + 오늘 클릭 수를 단일 쿼리로 (N+1 방지)
    click_result = await db.execute(
        select(
            func.sum(Link.click_count).label("total_clicks"),
            func.count(Link.id).label("total_links"),
        ).where(Link.user_id == user_id)
    )
    click_row = click_result.one()
    total_clicks = int(click_row.total_clicks or 0)
    total_links = int(click_row.total_links or 0)

    # 오늘 클릭 수 (LinkClick 테이블 기준)
    today_clicks_result = await db.execute(
        select(func.count(LinkClick.id)).where(
            LinkClick.user_id == user_id,
            LinkClick.clicked_at >= today_start,
        )
    )
    today_clicks = int(today_clicks_result.scalar() or 0)

    # 총 방문 수 + 오늘 방문 수를 단일 쿼리로
    view_result = await db.execute(
        select(
            func.count(ProfileView.id).label("total_views"),
            func.count(ProfileView.id).filter(ProfileView.viewed_at >= today_start).label("today_views"),
        ).where(ProfileView.user_id == user_id)
    )
    view_row = view_result.one()
    total_views = int(view_row.total_views or 0)
    today_views = int(view_row.today_views or 0)

    # CTR: 방문 대비 클릭 비율 (%)
    click_through_rate = round((total_clicks / total_views * 100), 2) if total_views > 0 else 0.0

    return AnalyticsSummary(
        total_clicks=total_clicks,
        total_views=total_views,
        total_links=total_links,
        today_clicks=today_clicks,
        today_views=today_views,
        click_through_rate=click_through_rate,
    )


async def get_link_stats(db: AsyncSession, user_id: uuid.UUID) -> list[LinkAnalytics]:
    result = await db.execute(
        select(Link).where(Link.user_id == user_id).order_by(Link.click_count.desc())
    )
    links = result.scalars().all()
    return [
        LinkAnalytics(
            id=link.id,
            title=link.title,
            url=link.url,
            click_count=link.click_count,
            is_active=link.is_active,
        )
        for link in links
    ]


async def get_view_stats(db: AsyncSession, user_id: uuid.UUID, days: int = 7) -> ViewStats:
    # days 값은 라우터에서 ge=1, le=90으로 이미 검증되므로 범위 내 모든 값 처리됨
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # 기간별 일별 집계 + unique_visitors (IP 기준)
    result = await db.execute(
        select(
            cast(ProfileView.viewed_at, Date).label("view_date"),
            func.count(ProfileView.id).label("view_count"),
            func.count(distinct(ProfileView.viewer_ip)).label("unique_visitors"),
        )
        .where(ProfileView.user_id == user_id, ProfileView.viewed_at >= since)
        .group_by("view_date")
        .order_by("view_date")
    )
    rows = result.all()

    # 날짜 범위 채우기 (데이터 없는 날도 0으로)
    all_dates: dict[date, dict] = {}
    for i in range(days):
        d = (datetime.now(timezone.utc) - timedelta(days=days - 1 - i)).date()
        all_dates[d] = {"view_count": 0, "unique_visitors": 0}

    for row in rows:
        all_dates[row.view_date] = {
            "view_count": row.view_count,
            "unique_visitors": row.unique_visitors,
        }

    daily = [
        DailyViewStats(
            date=d,
            view_count=data["view_count"],
            unique_visitors=data["unique_visitors"],
        )
        for d, data in sorted(all_dates.items())
    ]

    total_views = sum(item.view_count for item in daily)

    return ViewStats(days=days, total_views=total_views, daily=daily)


async def get_top_links(db: AsyncSession, user_id: uuid.UUID, limit: int = 5) -> list[TopLink]:
    # 총 방문 수 조회 (CTR 계산용)
    view_result = await db.execute(
        select(func.count(ProfileView.id)).where(ProfileView.user_id == user_id)
    )
    total_views = int(view_result.scalar() or 0)

    result = await db.execute(
        select(Link)
        .where(Link.user_id == user_id)
        .order_by(Link.click_count.desc())
        .limit(limit)
    )
    links = result.scalars().all()

    return [
        TopLink(
            id=link.id,
            title=link.title,
            url=link.url,
            click_count=link.click_count,
            ctr=round((link.click_count / total_views * 100), 2) if total_views > 0 else 0.0,
        )
        for link in links
    ]


async def get_recent_clicks(
    db: AsyncSession, user_id: uuid.UUID, limit: int = 10
) -> list[RecentClick]:
    # Link와 LinkClick 조인하여 최근 클릭 내역 조회
    result = await db.execute(
        select(LinkClick, Link.title)
        .join(Link, LinkClick.link_id == Link.id)
        .where(LinkClick.user_id == user_id)
        .order_by(LinkClick.clicked_at.desc())
        .limit(limit)
    )
    rows = result.all()

    def mask_ip(ip: str | None) -> str | None:
        """IP 마스킹: 마지막 옥텟을 ***로 치환"""
        if ip is None:
            return None
        parts = ip.split(".")
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.{parts[2]}.*"
        # IPv6 또는 기타 형식
        return ip[:max(0, len(ip) - 3)] + "***"

    return [
        RecentClick(
            link_id=click.link_id,
            title=title,
            clicked_at=click.clicked_at,
            visitor_ip=mask_ip(click.visitor_ip),
        )
        for click, title in rows
    ]
