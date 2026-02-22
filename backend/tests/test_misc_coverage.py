# 파일 목적: 기타 미커버 영역 테스트 (exceptions, health, dependencies)
# 주요 기능: BadRequestException 기본값, health 엔드포인트, get_current_user, get_db
# 사용 방법: pytest tests/test_misc_coverage.py

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.core.exceptions import BadRequestException, NotFoundException, UnauthorizedException
from app.main import app


class TestExceptions:
    def test_bad_request_default_message(self):
        """BadRequestException 기본 메시지"""
        exc = BadRequestException()
        assert exc.status_code == 400
        assert exc.detail == "잘못된 요청입니다."

    def test_not_found_default_message(self):
        """NotFoundException 기본 메시지"""
        exc = NotFoundException()
        assert exc.status_code == 404

    def test_unauthorized_default_message(self):
        """UnauthorizedException 기본 메시지"""
        exc = UnauthorizedException()
        assert exc.status_code == 401


class TestHealthEndpoint:
    async def test_health_check(self):
        """GET /api/health → 200"""
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.get("/api/health")
        assert response.status_code == 200


class TestGetCurrentUser:
    def test_verify_token_invalid(self):
        """잘못된 토큰 → verify_token이 None 반환"""
        from app.core.security import verify_token
        result = verify_token("invalid.token.here", token_type="access")
        assert result is None

    def test_verify_token_user_id_format(self):
        """유효한 토큰 생성 → verify_token이 user_id 문자열 반환"""
        from app.core.security import create_access_token, verify_token
        user_id = str(uuid.uuid4())
        token = create_access_token(user_id)
        result = verify_token(token, token_type="access")
        assert result == user_id


class TestSecurityVerifyToken:
    def test_verify_token_sub_none(self):
        """JWT payload에 sub 없음 → None 반환 (L47 커버)"""
        from datetime import datetime, timedelta, timezone
        from jose import jwt
        from app.core.security import verify_token
        from app.core.config import settings

        payload = {
            "type": "access",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
        }
        token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
        result = verify_token(token, "access")
        assert result is None


class TestConfigIsProduction:
    def test_is_production_false(self):
        """기본 환경에서 is_production = False"""
        from app.core.config import settings
        assert settings.is_production is False

    def test_is_production_true(self):
        """environment=production 일 때 is_production = True (L44 커버)"""
        from app.core.config import Settings
        s = Settings(
            secret_key="test-secret-key-long-enough",
            database_url="postgresql+asyncpg://test:test@localhost/test",
            environment="production",
        )
        assert s.is_production is True


class TestGetDb:
    async def test_get_db_yields_session_and_closes(self):
        """get_db가 AsyncSession을 yield하고 close()를 호출하는지 확인 (db.py L11-15 커버)"""
        from unittest.mock import patch, AsyncMock
        import app.dependencies.db as db_module
        from app.dependencies.db import get_db

        mock_session = AsyncMock()
        mock_session.close = AsyncMock()

        mock_cm = AsyncMock()
        mock_cm.__aenter__ = AsyncMock(return_value=mock_session)
        mock_cm.__aexit__ = AsyncMock(return_value=None)

        with patch.object(db_module, "AsyncSessionLocal", return_value=mock_cm):
            sessions = []
            async for session in get_db():
                sessions.append(session)

        assert len(sessions) == 1
        assert sessions[0] is mock_session
        mock_session.close.assert_awaited_once()


class TestLifespan:
    async def test_lifespan_startup_shutdown(self):
        """lifespan 컨텍스트 매니저 startup/shutdown 커버 (main.py L17)"""
        from app.main import lifespan, app as fastapi_app

        async with lifespan(fastapi_app):
            pass  # startup 완료, yield 통과, shutdown 실행


class TestDeleteAccountEndpoint:
    async def test_delete_account_graphql(self):
        """GraphQL deleteAccount mutation → True (GraphQL 엔드포인트 커버)"""
        from unittest.mock import AsyncMock, MagicMock
        from app.dependencies.db import get_db
        from app.core.security import create_access_token
        from app.models.user import User

        user_id = uuid.uuid4()
        mock_user = MagicMock(spec=User)
        mock_user.id = user_id

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute = AsyncMock(return_value=mock_result)

        async def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db
        token = create_access_token(str(user_id))

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
                headers={"Authorization": f"Bearer {token}"},
            ) as client:
                from unittest.mock import patch
                with patch("app.graphql.resolvers.auth.auth_service.delete_account", new_callable=AsyncMock):
                    response = await client.post(
                        "/graphql",
                        json={"query": "mutation { deleteAccount }"},
                    )
        finally:
            app.dependency_overrides.clear()

        data = response.json()
        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["deleteAccount"] is True
