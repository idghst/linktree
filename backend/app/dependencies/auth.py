# 파일 목적: FastAPI 인증 의존성 - Bearer 토큰 검증 및 현재 사용자 조회
# 주요 기능: get_current_user(Bearer 파싱→verify_token→User 조회)
# 사용 방법: async def endpoint(current_user: User = Depends(get_current_user)):

import uuid
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import verify_token
from app.core.exceptions import UnauthorizedException
from app.models.user import User
from app.dependencies.db import get_db

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = verify_token(token, token_type="access")

    if not user_id:
        raise UnauthorizedException("유효하지 않은 토큰입니다.")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("사용자를 찾을 수 없습니다.")

    if not user.is_active:
        raise UnauthorizedException("비활성화된 계정입니다.")

    return user
