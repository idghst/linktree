# 파일 목적: 프로필 GraphQL resolver 테스트 (myProfile, updateProfile)
# 주요 기능: POST /graphql 기반 프로필 operation 검증
# 사용 방법: pytest tests/test_graphql_profile.py

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import NotFoundException
from app.models.user import User


def _make_user(user_id: uuid.UUID | None = None) -> User:
    user = MagicMock(spec=User)
    user.id = user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
    user.username = "testuser"
    user.email = "test@example.com"
    user.display_name = "Test User"
    user.bio = None
    user.avatar_url = None
    user.theme = "default"
    user.bg_color = "#ffffff"
    user.is_active = True
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


GQL_MY_PROFILE = """
query {
  myProfile {
    id username email displayName theme bgColor
  }
}
"""

GQL_UPDATE_PROFILE = """
mutation {
  updateProfile(input: {displayName: "New Name", bio: "Hello"}) {
    id username displayName bio
  }
}
"""


class TestGraphQLMyProfile:
    async def test_my_profile_success(self, auth_gql_client, mocker, test_user_id):
        """인증된 사용자 → 내 프로필 반환"""
        mock_user = _make_user(test_user_id)
        mocker.patch(
            "app.graphql.resolvers.profile.profile_service.get_my_profile",
            new_callable=AsyncMock,
            return_value=mock_user,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_MY_PROFILE})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["myProfile"]["username"] == "testuser"
        assert data["data"]["myProfile"]["theme"] == "default"

    async def test_my_profile_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_MY_PROFILE})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data
        assert "인증이 필요합니다" in data["errors"][0]["message"]

    async def test_my_profile_not_found(self, auth_gql_client, mocker):
        """사용자 없음 → 에러"""
        mocker.patch(
            "app.graphql.resolvers.profile.profile_service.get_my_profile",
            new_callable=AsyncMock,
            side_effect=NotFoundException("사용자를 찾을 수 없습니다."),
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_MY_PROFILE})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLUpdateProfile:
    async def test_update_profile_success(self, auth_gql_client, mocker, test_user_id):
        """정상 프로필 수정"""
        mock_user = _make_user(test_user_id)
        mock_user.display_name = "New Name"
        mock_user.bio = "Hello"
        mocker.patch(
            "app.graphql.resolvers.profile.profile_service.update_profile",
            new_callable=AsyncMock,
            return_value=mock_user,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_UPDATE_PROFILE})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["updateProfile"]["displayName"] == "New Name"
        assert data["data"]["updateProfile"]["bio"] == "Hello"

    async def test_update_profile_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_UPDATE_PROFILE})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data

    async def test_update_profile_partial(self, auth_gql_client, mocker, test_user_id):
        """부분 업데이트 (theme만)"""
        mock_user = _make_user(test_user_id)
        mock_user.theme = "dark"
        mocker.patch(
            "app.graphql.resolvers.profile.profile_service.update_profile",
            new_callable=AsyncMock,
            return_value=mock_user,
        )

        query = """
        mutation {
          updateProfile(input: {theme: "dark"}) {
            id theme
          }
        }
        """
        response = await auth_gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["updateProfile"]["theme"] == "dark"
