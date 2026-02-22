# 파일 목적: services/auth.py 단위 테스트
# 주요 기능: register, login, refresh_token, change_password, delete_account 비즈니스 로직 검증
# 사용 방법: pytest tests/test_services_auth.py

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import ConflictException, UnauthorizedException
from app.models.user import User
from app.schemas.user import ChangePasswordRequest, LoginRequest, RegisterRequest
from app.services import auth as auth_service


def _make_user(is_active: bool = True) -> MagicMock:
    """테스트용 User mock 생성"""
    user = MagicMock(spec=User)
    user.id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    user.username = "testuser"
    user.email = "test@example.com"
    user.password_hash = "$2b$12$placeholder_hash"
    user.display_name = "Test User"
    user.is_active = is_active
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


def _make_execute_result(scalar_value):
    """db.execute() 반환값 mock"""
    result = MagicMock()
    result.scalar_one_or_none.return_value = scalar_value
    return result


@pytest.fixture
def mock_db():
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.add = MagicMock()
    session.delete = AsyncMock()
    session.refresh = AsyncMock()
    return session


class TestRegister:
    async def test_username_duplicate_raises_conflict(self, mock_db):
        """username 중복 → ConflictException"""
        mock_db.execute.return_value = _make_execute_result(_make_user())
        data = RegisterRequest(username="testuser", email="new@example.com", password="password123")

        with pytest.raises(ConflictException) as exc_info:
            await auth_service.register(mock_db, data)
        assert "username" in exc_info.value.detail

    async def test_email_duplicate_raises_conflict(self, mock_db):
        """email 중복 → ConflictException"""
        mock_db.execute.side_effect = [
            _make_execute_result(None),
            _make_execute_result(_make_user()),
        ]
        data = RegisterRequest(username="newuser", email="test@example.com", password="password123")

        with pytest.raises(ConflictException) as exc_info:
            await auth_service.register(mock_db, data)
        assert "이메일" in exc_info.value.detail

    async def test_register_success(self, mock_db):
        """정상 회원가입 → User 객체 반환, db.add/commit/refresh 호출"""
        mock_db.execute.side_effect = [
            _make_execute_result(None),
            _make_execute_result(None),
        ]
        data = RegisterRequest(username="newuser", email="new@example.com", password="password123")

        result = await auth_service.register(mock_db, data)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()
        mock_db.refresh.assert_awaited_once()
        assert result is not None

    async def test_register_with_display_name(self, mock_db):
        """display_name 지정 시 해당 값 사용"""
        mock_db.execute.side_effect = [
            _make_execute_result(None),
            _make_execute_result(None),
        ]
        data = RegisterRequest(
            username="newuser",
            email="new@example.com",
            password="password123",
            display_name="Custom Name",
        )

        await auth_service.register(mock_db, data)

        added_user = mock_db.add.call_args[0][0]
        assert added_user.display_name == "Custom Name"

    async def test_register_without_display_name_uses_username(self, mock_db):
        """display_name 미지정 시 username 사용"""
        mock_db.execute.side_effect = [
            _make_execute_result(None),
            _make_execute_result(None),
        ]
        data = RegisterRequest(username="newuser", email="new@example.com", password="password123")

        await auth_service.register(mock_db, data)

        added_user = mock_db.add.call_args[0][0]
        assert added_user.display_name == "newuser"


class TestLogin:
    async def test_user_not_found_raises_unauthorized(self, mock_db):
        """사용자 없음 → UnauthorizedException"""
        mock_db.execute.return_value = _make_execute_result(None)
        data = LoginRequest(email="notfound@example.com", password="password123")

        with pytest.raises(UnauthorizedException):
            await auth_service.login(mock_db, data)

    async def test_wrong_password_raises_unauthorized(self, mock_db):
        """비밀번호 불일치 → UnauthorizedException"""
        mock_db.execute.return_value = _make_execute_result(_make_user())
        data = LoginRequest(email="test@example.com", password="wrongpassword")

        with patch("app.services.auth.verify_password", return_value=False):
            with pytest.raises(UnauthorizedException):
                await auth_service.login(mock_db, data)

    async def test_inactive_user_raises_unauthorized(self, mock_db):
        """비활성 계정 → UnauthorizedException"""
        inactive_user = _make_user(is_active=False)
        mock_db.execute.return_value = _make_execute_result(inactive_user)
        data = LoginRequest(email="test@example.com", password="password123")

        with patch("app.services.auth.verify_password", return_value=True):
            with pytest.raises(UnauthorizedException) as exc_info:
                await auth_service.login(mock_db, data)
        assert "비활성" in exc_info.value.detail

    async def test_login_success_returns_token_response(self, mock_db):
        """정상 로그인 → TokenResponse 반환"""
        mock_db.execute.return_value = _make_execute_result(_make_user())
        data = LoginRequest(email="test@example.com", password="password123")

        with patch("app.services.auth.verify_password", return_value=True):
            result = await auth_service.login(mock_db, data)

        assert result.access_token
        assert result.refresh_token
        assert result.token_type == "bearer"


class TestRefreshToken:
    async def test_invalid_token_raises_unauthorized(self, mock_db):
        """유효하지 않은 토큰 → UnauthorizedException"""
        with patch("app.services.auth.verify_token", return_value=None):
            with pytest.raises(UnauthorizedException) as exc_info:
                await auth_service.refresh_token(mock_db, "invalid_token")
        assert "refresh token" in exc_info.value.detail

    async def test_user_not_found_raises_unauthorized(self, mock_db):
        """유효한 토큰이지만 사용자 없음 → UnauthorizedException"""
        user_id = str(uuid.UUID("00000000-0000-0000-0000-000000000001"))
        mock_db.execute.return_value = _make_execute_result(None)

        with patch("app.services.auth.verify_token", return_value=user_id):
            with pytest.raises(UnauthorizedException) as exc_info:
                await auth_service.refresh_token(mock_db, "some_token")
        assert "사용자" in exc_info.value.detail

    async def test_inactive_user_raises_unauthorized(self, mock_db):
        """비활성 사용자 토큰 갱신 → UnauthorizedException"""
        user_id = str(uuid.UUID("00000000-0000-0000-0000-000000000001"))
        inactive_user = _make_user(is_active=False)
        mock_db.execute.return_value = _make_execute_result(inactive_user)

        with patch("app.services.auth.verify_token", return_value=user_id):
            with pytest.raises(UnauthorizedException):
                await auth_service.refresh_token(mock_db, "some_token")

    async def test_refresh_success_returns_new_tokens(self, mock_db):
        """정상 토큰 갱신 → 새 TokenResponse 반환"""
        user_id = str(uuid.UUID("00000000-0000-0000-0000-000000000001"))
        mock_db.execute.return_value = _make_execute_result(_make_user())

        with patch("app.services.auth.verify_token", return_value=user_id):
            result = await auth_service.refresh_token(mock_db, "some_token")

        assert result.access_token
        assert result.refresh_token


class TestChangePassword:
    async def test_wrong_current_password_raises_unauthorized(self, mock_db):
        """현재 비밀번호 불일치 → UnauthorizedException"""
        user = _make_user()
        data = ChangePasswordRequest(current_password="wrongpass", new_password="newpassword123")

        with patch("app.services.auth.verify_password", return_value=False):
            with pytest.raises(UnauthorizedException) as exc_info:
                await auth_service.change_password(mock_db, user, data)
        assert "비밀번호" in exc_info.value.detail

    async def test_change_password_success(self, mock_db):
        """정상 비밀번호 변경 → 해시 갱신 및 commit 호출"""
        user = _make_user()
        data = ChangePasswordRequest(current_password="correctpass", new_password="newpassword123")

        with patch("app.services.auth.verify_password", return_value=True):
            with patch("app.services.auth.hash_password", return_value="new_hashed_pw"):
                await auth_service.change_password(mock_db, user, data)

        assert user.password_hash == "new_hashed_pw"
        mock_db.commit.assert_awaited_once()


class TestDeleteAccount:
    async def test_delete_account_calls_delete_and_commit(self, mock_db):
        """계정 삭제 → db.delete(user) + db.commit() 호출"""
        user = _make_user()

        await auth_service.delete_account(mock_db, user)

        mock_db.delete.assert_called_once_with(user)
        mock_db.commit.assert_awaited_once()
