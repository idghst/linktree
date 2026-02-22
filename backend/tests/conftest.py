# 파일 목적: pytest 공통 픽스처 정의 - 테스트 앱, DB mock, 인증 헬퍼, GraphQL 클라이언트
# 주요 기능: AsyncClient fixture, AsyncSession mock, JWT 토큰 생성, gql_client/auth_gql_client
# 사용 방법: 테스트 파일에서 fixture 이름으로 자동 주입 (pytest dependency injection)

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import AsyncClient, ASGITransport

from app.core.security import create_access_token
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.main import app
from app.models.user import User


@pytest.fixture
def mock_db():
    """실제 PostgreSQL 없이 사용 가능한 AsyncSession mock"""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    session.add = MagicMock()
    session.delete = MagicMock()
    session.flush = AsyncMock()
    session.refresh = AsyncMock()
    return session


@pytest.fixture
def test_user_id() -> uuid.UUID:
    """고정된 테스트 사용자 UUID"""
    return uuid.UUID("00000000-0000-0000-0000-000000000001")


@pytest.fixture
def test_user(test_user_id: uuid.UUID) -> User:
    """테스트용 User 모델 인스턴스"""
    user = User()
    user.id = test_user_id
    user.username = "testuser"
    user.email = "test@example.com"
    user.password_hash = "$2b$12$placeholder_hash"
    user.display_name = "Test User"
    user.bio = None
    user.avatar_url = None
    user.social_links = None
    user.seo_settings = None
    user.theme = "default"
    user.bg_color = "#ffffff"
    user.is_active = True
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


@pytest.fixture
def test_user_data(test_user_id: uuid.UUID) -> dict:
    """테스트용 사용자 데이터 딕셔너리"""
    return {
        "id": str(test_user_id),
        "username": "testuser",
        "email": "test@example.com",
        "display_name": "Test User",
        "bio": None,
        "avatar_url": None,
        "theme": "default",
        "bg_color": "#ffffff",
        "is_active": True,
    }


@pytest.fixture
def auth_headers(test_user_id: uuid.UUID) -> dict:
    """인증이 필요한 요청에 사용할 Bearer 토큰 헤더"""
    token = create_access_token(subject=str(test_user_id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def client(mock_db: AsyncMock):
    """DB mock이 주입된 비동기 테스트 HTTP 클라이언트"""

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def auth_client(mock_db: AsyncMock, test_user: User):
    """인증된 사용자로 사전 설정된 테스트 HTTP 클라이언트"""

    async def override_get_db():
        yield mock_db

    async def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def gql_client(mock_db: AsyncMock):
    """비인증 GraphQL 테스트 클라이언트"""

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def auth_gql_client(mock_db: AsyncMock, test_user_id: uuid.UUID):
    """인증된 GraphQL 테스트 클라이언트 (Bearer 토큰 헤더 포함)"""

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    token = create_access_token(subject=str(test_user_id))

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"},
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
