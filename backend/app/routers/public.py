# 파일 목적: 공개 프로필 및 클릭 추적 엔드포인트 (인증 불필요)
# 주요 기능: GET /public/{username}, POST /public/{username}/view, GET /public/links/{id}/click (302)
# 사용 방법: app.include_router(public.router, prefix="/api/public", tags=["public"])

import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies.db import get_db
from app.schemas.profile import PublicProfileResponse
from app.services import profile as profile_service
from app.models.link import Link
from app.models.analytics import ProfileView, LinkClick
from app.models.user import User
from app.core.exceptions import NotFoundException

router = APIRouter()


@router.get("/{username}", response_model=PublicProfileResponse)
async def get_public_profile(
    username: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await profile_service.get_public_profile(db, username)


@router.post("/{username}/view")
async def record_view(
    username: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(User).where(User.username == username, User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException(f"'{username}' 사용자를 찾을 수 없습니다.")

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]

    # 중복 방문 방지: 같은 IP에서 1시간 이내 재방문은 기록하지 않음
    if client_ip:
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        existing = await db.execute(
            select(ProfileView).where(
                ProfileView.user_id == user.id,
                ProfileView.viewer_ip == client_ip,
                ProfileView.viewed_at >= one_hour_ago,
            )
        )
        if existing.scalar_one_or_none() is not None:
            return {"status": "already_recorded"}

    view = ProfileView(
        user_id=user.id,
        viewer_ip=client_ip,
        user_agent=user_agent,
    )
    db.add(view)
    await db.commit()
    return {"status": "recorded"}


@router.get("/links/{link_id}/click")
async def record_click(
    link_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    result = await db.execute(
        select(Link).where(Link.id == link_id, Link.is_active == True)  # noqa: E712
    )
    link = result.scalar_one_or_none()

    if not link:
        raise NotFoundException("링크를 찾을 수 없습니다.")

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]

    click = LinkClick(
        link_id=link.id,
        user_id=link.user_id,
        visitor_ip=client_ip,
        user_agent=user_agent,
    )
    db.add(click)
    link.click_count += 1
    await db.commit()

    return RedirectResponse(url=link.url, status_code=302)
