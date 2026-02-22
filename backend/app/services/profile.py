# 파일 목적: 프로필 조회 및 수정 비즈니스 로직
# 주요 기능: get_my_profile, update_profile, get_public_profile(username→활성 링크 포함, 예약 필터링)
# 사용 방법: from app.services.profile import get_my_profile, get_public_profile

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.user import User
from app.models.link import Link
from app.schemas.profile import UpdateProfileRequest
from app.core.exceptions import NotFoundException
from fastapi import HTTPException


# User 모델에서 업데이트 허용 필드 목록
_ALLOWED_PROFILE_FIELDS = {
    "display_name",
    "bio",
    "avatar_url",
    "social_links",
    "seo_settings",
    "theme",
    "bg_color",
}


async def get_my_profile(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("사용자를 찾을 수 없습니다.")
    return user


async def update_profile(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: UpdateProfileRequest,
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("사용자를 찾을 수 없습니다.")

    update_data = data.model_dump(exclude_unset=True)
    invalid_fields = set(update_data.keys()) - _ALLOWED_PROFILE_FIELDS
    if invalid_fields:
        raise HTTPException(
            status_code=400,
            detail=f"업데이트할 수 없는 필드입니다: {', '.join(sorted(invalid_fields))}",
        )

    for field, value in update_data.items():
        if not hasattr(user, field):  # pragma: no cover
            raise HTTPException(  # pragma: no cover
                status_code=400,
                detail=f"존재하지 않는 필드입니다: {field}",
            )
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


async def get_public_profile(db: AsyncSession, username: str) -> dict:
    result = await db.execute(
        select(User).where(User.username == username, User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException(f"'{username}' 사용자를 찾을 수 없습니다.")

    now = datetime.now(timezone.utc)
    links_result = await db.execute(
        select(Link)
        .where(
            Link.user_id == user.id,
            Link.is_active == True,  # noqa: E712
            or_(Link.scheduled_start == None, Link.scheduled_start <= now),  # noqa: E711
            or_(Link.scheduled_end == None, Link.scheduled_end > now),  # noqa: E711
        )
        .order_by(Link.position)
    )
    links = list(links_result.scalars().all())

    return {
        "username": user.username,
        "display_name": user.display_name,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "social_links": user.social_links,
        "seo_settings": user.seo_settings,
        "theme": user.theme,
        "bg_color": user.bg_color,
        "links": links,
    }
