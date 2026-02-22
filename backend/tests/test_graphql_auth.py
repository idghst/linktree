# 파일 목적: 인증 GraphQL resolver 테스트 (me, register, login, refresh, changePassword, deleteAccount)
# 주요 기능: POST /graphql 기반 인증 operation 검증
# 사용 방법: pytest tests/test_graphql_auth.py

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_refresh_token
from app.models.user import User
from app.schemas.token import TokenResponse


def _make_user(user_id: uuid.UUID | None = None) -> User:
    user = MagicMock(spec=User)
    user.id = user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
    user.username = "testuser"
    user.email = "test@example.com"
    user.password_hash = "$2b$12$placeholder"
    user.display_name = "Test User"
    user.bio = None
    user.avatar_url = None
    user.social_links = None
    user.theme = "default"
    user.bg_color = "#ffffff"
    user.is_active = True
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


GQL_ME = "{ me { id username email } }"
GQL_REGISTER = """
mutation {
  register(input: {username: "testuser", email: "test@example.com", password: "password123"}) {
    id username email
  }
}
"""
GQL_LOGIN = """
mutation {
  login(input: {email: "test@example.com", password: "password123"}) {
    accessToken refreshToken tokenType
  }
}
"""
GQL_CHANGE_PASSWORD = """
mutation {
  changePassword(input: {currentPassword: "oldpass123", newPassword: "newpass123"})
}
"""
GQL_DELETE_ACCOUNT = "mutation { deleteAccount }"


class TestGraphQLMe:
    async def test_me_authenticated(self, auth_gql_client, mock_db, test_user_id):
        """인증된 사용자 → me 쿼리 성공"""
        mock_user = _make_user(test_user_id)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute = AsyncMock(return_value=mock_result)

        response = await auth_gql_client.post("/graphql", json={"query": GQL_ME})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["me"]["username"] == "testuser"

    async def test_me_unauthenticated(self, gql_client):
        """비인증 → me 쿼리 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_ME})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data
        assert "인증이 필요합니다" in data["errors"][0]["message"]


class TestGraphQLRegister:
    async def test_register_success(self, gql_client, mock_db, mocker):
        """정상 회원가입"""
        mock_user = _make_user()
        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.register",
            new_callable=AsyncMock,
            return_value=mock_user,
        )

        response = await gql_client.post("/graphql", json={"query": GQL_REGISTER})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["register"]["username"] == "testuser"

    async def test_register_duplicate_username(self, gql_client, mocker):
        """중복 username → GraphQL 에러"""
        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.register",
            new_callable=AsyncMock,
            side_effect=ConflictException("이미 사용 중인 username입니다."),
        )

        response = await gql_client.post("/graphql", json={"query": GQL_REGISTER})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data
        assert "이미 사용 중인 username" in data["errors"][0]["message"]

    async def test_register_invalid_input(self, gql_client):
        """유효하지 않은 이메일 → Pydantic 검증 에러"""
        query = """
        mutation {
          register(input: {username: "u", email: "notanemail", password: "short"}) {
            id
          }
        }
        """
        response = await gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLLogin:
    async def test_login_success(self, gql_client, mocker):
        """정상 로그인 → 토큰 반환"""
        mock_token = TokenResponse(
            access_token="mock_access",
            refresh_token="mock_refresh",
        )
        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.login",
            new_callable=AsyncMock,
            return_value=mock_token,
        )

        response = await gql_client.post("/graphql", json={"query": GQL_LOGIN})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["login"]["accessToken"] == "mock_access"
        assert data["data"]["login"]["tokenType"] == "bearer"

    async def test_login_wrong_password(self, gql_client, mocker):
        """잘못된 비밀번호 → 에러"""
        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.login",
            new_callable=AsyncMock,
            side_effect=UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다."),
        )

        response = await gql_client.post("/graphql", json={"query": GQL_LOGIN})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLRefreshToken:
    async def test_refresh_success(self, gql_client, mocker, test_user_id):
        """유효한 refresh_token → 새 토큰"""
        mock_token = TokenResponse(
            access_token="new_access",
            refresh_token="new_refresh",
        )
        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.refresh_token",
            new_callable=AsyncMock,
            return_value=mock_token,
        )
        refresh_tok = create_refresh_token(str(test_user_id))
        query = f"""
        mutation {{
          refreshToken(input: {{refreshToken: "{refresh_tok}"}}) {{
            accessToken refreshToken
          }}
        }}
        """

        response = await gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["refreshToken"]["accessToken"] == "new_access"

    async def test_refresh_invalid_token(self, gql_client, mocker):
        """유효하지 않은 refresh_token → 에러"""
        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.refresh_token",
            new_callable=AsyncMock,
            side_effect=UnauthorizedException("유효하지 않은 refresh token입니다."),
        )
        query = """
        mutation {
          refreshToken(input: {refreshToken: "invalid.token"}) {
            accessToken
          }
        }
        """

        response = await gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLChangePassword:
    async def test_change_password_success(self, auth_gql_client, mock_db, test_user_id, mocker):
        """정상 비밀번호 변경"""
        mock_user = _make_user(test_user_id)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute = AsyncMock(return_value=mock_result)

        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.change_password",
            new_callable=AsyncMock,
            return_value=None,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_CHANGE_PASSWORD})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["changePassword"] is True

    async def test_change_password_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_CHANGE_PASSWORD})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLDeleteAccount:
    async def test_delete_account_success(self, auth_gql_client, mock_db, test_user_id, mocker):
        """정상 계정 삭제"""
        mock_user = _make_user(test_user_id)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute = AsyncMock(return_value=mock_result)

        mocker.patch(
            "app.graphql.resolvers.auth.auth_service.delete_account",
            new_callable=AsyncMock,
            return_value=None,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_DELETE_ACCOUNT})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["deleteAccount"] is True

    async def test_delete_account_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_DELETE_ACCOUNT})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data
