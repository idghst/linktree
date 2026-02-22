# 파일 목적: 통계/분석 HTTP 엔드포인트 라우터
# 주요 기능: GET /analytics/summary, /analytics/links, /analytics/views, /analytics/top-links, /analytics/recent-clicks
# 사용 방법: app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.schemas.analytics import (
    AnalyticsSummary,
    LinkAnalytics,
    ViewStats,
    TopLink,
    RecentClick,
)
from app.services import analytics as analytics_service
from app.models.user import User

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsSummary:
    return await analytics_service.get_summary(db, current_user.id)


@router.get("/links", response_model=list[LinkAnalytics])
async def get_link_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list:
    return await analytics_service.get_link_stats(db, current_user.id)


@router.get("/views", response_model=ViewStats)
async def get_view_stats(
    days: int = Query(default=7, ge=1, le=90, description="조회 기간 (일), 1~90 사이 값"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ViewStats:
    return await analytics_service.get_view_stats(db, current_user.id, days)


@router.get("/top-links", response_model=list[TopLink])
async def get_top_links(
    limit: int = Query(default=5, ge=1, le=50, description="반환할 링크 수 (최대 50)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TopLink]:
    return await analytics_service.get_top_links(db, current_user.id, limit)


@router.get("/recent-clicks", response_model=list[RecentClick])
async def get_recent_clicks(
    limit: int = Query(default=10, ge=1, le=100, description="반환할 클릭 수 (최대 100)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[RecentClick]:
    return await analytics_service.get_recent_clicks(db, current_user.id, limit)
