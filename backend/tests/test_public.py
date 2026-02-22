# 파일 목적: 공개 프로필/클릭 추적 엔드포인트 테스트 (인증 불필요)
# 주요 기능: GET /api/public/{username}, POST /api/public/{username}/view, GET /api/public/links/{id}/click
# 사용 방법: pytest tests/test_public.py

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import NotFoundException
from app.models.link import Link
from app.models.user import User
from app.schemas.profile import PublicProfileResponse


def _make_public_user(username: str = "testuser") -> MagicMock:
    user = MagicMock(spec=User)
    user.id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    user.username = username
    user.is_active = True
    return user


def _make_active_link(link_id: uuid.UUID | None = None, url: str = "https://example.com") -> MagicMock:
    link = MagicMock(spec=Link)
    link.id = link_id or uuid.uuid4()
    link.user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    link.title = "공개 링크"
    link.url = url
    link.description = None
    link.thumbnail_url = None
    link.position = 0
    link.is_active = True
    link.click_count = 5
    link.created_at = datetime.now(timezone.utc)
    link.updated_at = datetime.now(timezone.utc)
    return link


LINK_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")


class TestPublicProfile:
    async def test_get_public_profile_success(self, client, mocker):
        """공개 프로필 조회 → 200 + PublicProfileResponse"""
        mock_response = PublicProfileResponse(
            username="testuser",
            display_name="Test User",
            bio="안녕하세요",
            avatar_url=None,
            social_links=None,
            theme="default",
            bg_color="#ffffff",
            links=[],
        )
        mocker.patch(
            "app.routers.public.profile_service.get_public_profile",
            new_callable=AsyncMock,
            return_value=mock_response,
        )

        response = await client.get("/api/public/testuser")

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["bio"] == "안녕하세요"
        assert isinstance(data["links"], list)

    async def test_get_public_profile_not_found(self, client, mocker):
        """존재하지 않는 username → 404"""
        mocker.patch(
            "app.routers.public.profile_service.get_public_profile",
            new_callable=AsyncMock,
            side_effect=NotFoundException("'unknown' 사용자를 찾을 수 없습니다."),
        )

        response = await client.get("/api/public/unknown")

        assert response.status_code == 404

    async def test_get_public_profile_no_auth_required(self, client, mocker):
        """인증 없이도 접근 가능"""
        mock_response = PublicProfileResponse(
            username="openuser",
            display_name=None,
            bio=None,
            avatar_url=None,
            social_links=None,
            theme="default",
            bg_color="#ffffff",
            links=[],
        )
        mocker.patch(
            "app.routers.public.profile_service.get_public_profile",
            new_callable=AsyncMock,
            return_value=mock_response,
        )

        # Authorization 헤더 없이 요청
        response = await client.get("/api/public/openuser")

        assert response.status_code == 200


class TestRecordView:
    async def test_record_view_success(self, client, mock_db):
        """신규 방문 기록 → 200 + {"status": "recorded"}"""
        mock_user = _make_public_user()

        # 1차 execute: 사용자 조회 → 사용자 반환
        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = mock_user

        # 2차 execute: 중복 방문 확인 → 없음 (None 반환)
        view_result = MagicMock()
        view_result.scalar_one_or_none.return_value = None

        mock_db.execute.side_effect = [user_result, view_result]

        response = await client.post("/api/public/testuser/view")

        assert response.status_code == 200
        assert response.json()["status"] == "recorded"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    async def test_record_view_duplicate(self, client, mock_db):
        """1시간 이내 재방문 → 200 + {"status": "already_recorded"}"""
        mock_user = _make_public_user()
        existing_view = MagicMock()

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = mock_user

        view_result = MagicMock()
        view_result.scalar_one_or_none.return_value = existing_view  # 이미 기록됨

        mock_db.execute.side_effect = [user_result, view_result]

        response = await client.post("/api/public/testuser/view")

        assert response.status_code == 200
        assert response.json()["status"] == "already_recorded"

    async def test_record_view_user_not_found(self, client, mock_db):
        """존재하지 않는 username → 404"""
        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = None  # 사용자 없음
        mock_db.execute.return_value = user_result

        response = await client.post("/api/public/nonexistent/view")

        assert response.status_code == 404


class TestRecordClick:
    async def test_record_click_redirect(self, client, mock_db):
        """활성 링크 클릭 → 302 redirect"""
        mock_link = _make_active_link(link_id=LINK_ID, url="https://example.com")

        link_result = MagicMock()
        link_result.scalar_one_or_none.return_value = mock_link
        mock_db.execute.return_value = link_result

        response = await client.get(
            f"/api/public/links/{LINK_ID}/click",
            follow_redirects=False,
        )

        assert response.status_code == 302
        assert response.headers["location"] == "https://example.com"

    async def test_record_click_not_found(self, client, mock_db):
        """존재하지 않거나 비활성 링크 → 404"""
        link_result = MagicMock()
        link_result.scalar_one_or_none.return_value = None  # 링크 없음
        mock_db.execute.return_value = link_result

        response = await client.get(
            f"/api/public/links/{LINK_ID}/click",
            follow_redirects=False,
        )

        assert response.status_code == 404

    async def test_record_click_increments_count(self, client, mock_db):
        """클릭 시 click_count 증가 및 DB 저장"""
        mock_link = _make_active_link(link_id=LINK_ID)
        mock_link.click_count = 5

        link_result = MagicMock()
        link_result.scalar_one_or_none.return_value = mock_link
        mock_db.execute.return_value = link_result

        await client.get(
            f"/api/public/links/{LINK_ID}/click",
            follow_redirects=False,
        )

        # click_count가 증가되고 commit이 호출됐는지 확인
        assert mock_link.click_count == 6
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
