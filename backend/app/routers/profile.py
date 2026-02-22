# 파일 목적: 프로필 조회/수정 HTTP 엔드포인트 라우터
# 주요 기능: GET/PUT /profile - 내 프로필 조회 및 수정
# 사용 방법: app.include_router(profile.router, prefix="/api/profile", tags=["profile"])

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.schemas.profile import UpdateProfileRequest, ProfileResponse
from app.services import profile as profile_service
from app.models.user import User

router = APIRouter()


@router.get("", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await profile_service.get_my_profile(db, current_user.id)


@router.put("", response_model=ProfileResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await profile_service.update_profile(db, current_user.id, data)
