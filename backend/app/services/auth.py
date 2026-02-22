# 파일 목적: 인증 비즈니스 로직 (회원가입, 로그인, 토큰 갱신)
# 주요 기능: register(중복확인→User생성), login(비번검증→JWT), refresh_token
# 사용 방법: from app.services.auth import register, login, refresh_token

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import RegisterRequest, LoginRequest, ChangePasswordRequest
from app.schemas.token import TokenResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.core.exceptions import ConflictException, UnauthorizedException


async def register(db: AsyncSession, data: RegisterRequest) -> User:
    # username 중복 확인
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise ConflictException("이미 사용 중인 username입니다.")

    # email 중복 확인
    result = await db.execute(select(User).where(User.email == str(data.email)))
    if result.scalar_one_or_none():
        raise ConflictException("이미 사용 중인 이메일입니다.")

    user = User(
        id=uuid.uuid4(),
        username=data.username,
        email=str(data.email),
        password_hash=hash_password(data.password),
        display_name=data.display_name or data.username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == str(data.email)))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.")

    if not user.is_active:
        raise UnauthorizedException("비활성화된 계정입니다.")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


async def refresh_token(db: AsyncSession, token: str) -> TokenResponse:
    user_id = verify_token(token, token_type="refresh")
    if not user_id:
        raise UnauthorizedException("유효하지 않은 refresh token입니다.")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedException("사용자를 찾을 수 없습니다.")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


async def change_password(db: AsyncSession, user: User, data: ChangePasswordRequest) -> None:
    if not verify_password(data.current_password, user.password_hash):
        raise UnauthorizedException("현재 비밀번호가 올바르지 않습니다.")

    user.password_hash = hash_password(data.new_password)
    await db.commit()


async def delete_account(db: AsyncSession, user: User) -> None:
    await db.delete(user)
    await db.commit()
