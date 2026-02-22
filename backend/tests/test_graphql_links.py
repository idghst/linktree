# 파일 목적: 링크 GraphQL resolver 테스트 (links, createLink, updateLink, deleteLink, reorder, toggle)
# 주요 기능: POST /graphql 기반 링크 CRUD operation 검증
# 사용 방법: pytest tests/test_graphql_links.py

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.link import Link


def _make_link(link_id: uuid.UUID | None = None, user_id: uuid.UUID | None = None) -> Link:
    link = MagicMock(spec=Link)
    link.id = link_id or uuid.uuid4()
    link.user_id = user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
    link.title = "Test Link"
    link.url = "https://example.com"
    link.description = None
    link.thumbnail_url = None
    link.favicon_url = None
    link.position = 0
    link.is_active = True
    link.click_count = 0
    link.scheduled_start = None
    link.scheduled_end = None
    link.is_sensitive = False
    link.link_type = "link"
    link.created_at = datetime.now(timezone.utc)
    link.updated_at = datetime.now(timezone.utc)
    return link


GQL_LINKS = """
query {
  links {
    id title url isActive position
  }
}
"""

GQL_CREATE_LINK = """
mutation {
  createLink(input: {title: "New Link", url: "https://example.com"}) {
    id title url isActive
  }
}
"""

GQL_DELETE_LINK = """
mutation {
  deleteLink(linkId: "00000000-0000-0000-0000-000000000002")
}
"""

GQL_TOGGLE_LINK = """
mutation {
  toggleLink(linkId: "00000000-0000-0000-0000-000000000002") {
    id isActive
  }
}
"""


class TestGraphQLLinks:
    async def test_links_authenticated(self, auth_gql_client, mocker):
        """인증된 사용자 → 링크 목록 반환"""
        mock_link = _make_link()
        mocker.patch(
            "app.graphql.resolvers.links.link_service.list_links",
            new_callable=AsyncMock,
            return_value=[mock_link],
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_LINKS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert len(data["data"]["links"]) == 1
        assert data["data"]["links"][0]["title"] == "Test Link"

    async def test_links_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_LINKS})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data

    async def test_links_empty(self, auth_gql_client, mocker):
        """링크 없음 → 빈 배열"""
        mocker.patch(
            "app.graphql.resolvers.links.link_service.list_links",
            new_callable=AsyncMock,
            return_value=[],
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_LINKS})
        data = response.json()

        assert response.status_code == 200
        assert data["data"]["links"] == []


class TestGraphQLCreateLink:
    async def test_create_link_success(self, auth_gql_client, mocker):
        """정상 링크 생성"""
        mock_link = _make_link()
        mock_link.title = "New Link"
        mocker.patch(
            "app.graphql.resolvers.links.link_service.create_link",
            new_callable=AsyncMock,
            return_value=mock_link,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_CREATE_LINK})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["createLink"]["title"] == "New Link"

    async def test_create_link_unauthenticated(self, gql_client):
        """미인증 → 에러"""
        response = await gql_client.post("/graphql", json={"query": GQL_CREATE_LINK})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data

    async def test_create_link_invalid_url(self, auth_gql_client, mocker):
        """유효하지 않은 URL → Pydantic 검증 에러"""
        query = """
        mutation {
          createLink(input: {title: "Test", url: "javascript:alert(1)"}) {
            id
          }
        }
        """
        response = await auth_gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLUpdateLink:
    async def test_update_link_success(self, auth_gql_client, mocker):
        """정상 링크 수정"""
        mock_link = _make_link(link_id=uuid.UUID("00000000-0000-0000-0000-000000000002"))
        mock_link.title = "Updated Title"
        mocker.patch(
            "app.graphql.resolvers.links.link_service.update_link",
            new_callable=AsyncMock,
            return_value=mock_link,
        )

        query = """
        mutation {
          updateLink(
            linkId: "00000000-0000-0000-0000-000000000002",
            input: {title: "Updated Title"}
          ) {
            id title
          }
        }
        """
        response = await auth_gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["updateLink"]["title"] == "Updated Title"

    async def test_update_link_not_found(self, auth_gql_client, mocker):
        """존재하지 않는 링크 → 에러"""
        mocker.patch(
            "app.graphql.resolvers.links.link_service.update_link",
            new_callable=AsyncMock,
            side_effect=NotFoundException("링크를 찾을 수 없습니다."),
        )

        query = """
        mutation {
          updateLink(
            linkId: "00000000-0000-0000-0000-000000000099",
            input: {title: "Test"}
          ) { id }
        }
        """
        response = await auth_gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLDeleteLink:
    async def test_delete_link_success(self, auth_gql_client, mocker):
        """정상 링크 삭제"""
        mocker.patch(
            "app.graphql.resolvers.links.link_service.delete_link",
            new_callable=AsyncMock,
            return_value=None,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_DELETE_LINK})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["deleteLink"] is True

    async def test_delete_link_forbidden(self, auth_gql_client, mocker):
        """권한 없음 → 에러"""
        mocker.patch(
            "app.graphql.resolvers.links.link_service.delete_link",
            new_callable=AsyncMock,
            side_effect=ForbiddenException("이 링크를 삭제할 권한이 없습니다."),
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_DELETE_LINK})
        data = response.json()

        assert response.status_code == 200
        assert "errors" in data


class TestGraphQLReorderLinks:
    async def test_reorder_links_success(self, auth_gql_client, mocker):
        """정상 링크 순서 변경"""
        mock_links = [_make_link(), _make_link()]
        mocker.patch(
            "app.graphql.resolvers.links.link_service.reorder_links",
            new_callable=AsyncMock,
            return_value=mock_links,
        )

        query = """
        mutation {
          reorderLinks(items: [
            {id: "00000000-0000-0000-0000-000000000002", position: 0},
            {id: "00000000-0000-0000-0000-000000000003", position: 1}
          ]) {
            id position
          }
        }
        """
        response = await auth_gql_client.post("/graphql", json={"query": query})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert len(data["data"]["reorderLinks"]) == 2


class TestGraphQLToggleLink:
    async def test_toggle_link_success(self, auth_gql_client, mocker):
        """정상 링크 토글"""
        mock_link = _make_link(link_id=uuid.UUID("00000000-0000-0000-0000-000000000002"))
        mock_link.is_active = False
        mocker.patch(
            "app.graphql.resolvers.links.link_service.toggle_link",
            new_callable=AsyncMock,
            return_value=mock_link,
        )

        response = await auth_gql_client.post("/graphql", json={"query": GQL_TOGGLE_LINK})
        data = response.json()

        assert response.status_code == 200
        assert "errors" not in data
        assert data["data"]["toggleLink"]["isActive"] is False
