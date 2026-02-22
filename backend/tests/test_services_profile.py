# 파일 목적: profile 서비스 단위 테스트
# 주요 기능: get_my_profile, update_profile, get_public_profile
# 사용 방법: pytest tests/test_services_profile.py

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import NotFoundException
from app.models.link import Link
from app.models.user import User
from app.schemas.profile import UpdateProfileRequest
from app.services import profile as profile_service

USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def _make_user(user_id=USER_ID, username="testuser", is_active=True):
    user = MagicMock(spec=User)
    user.id = user_id
    user.username = username
    user.display_name = "테스트 유저"
    user.bio = None
    user.avatar_url = None
    user.social_links = None
    user.seo_settings = None
    user.theme = "default"
    user.bg_color = "#ffffff"
    user.is_active = is_active
    return user


def _make_db():
    db = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


class TestGetMyProfile:
    async def test_success(self):
        db = _make_db()
        user = _make_user()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        db.execute = AsyncMock(return_value=mock_result)

        result = await profile_service.get_my_profile(db, USER_ID)

        assert result is user

    async def test_not_found(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(NotFoundException):
            await profile_service.get_my_profile(db, USER_ID)


class TestUpdateProfile:
    async def test_success(self):
        db = _make_db()
        user = _make_user()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        db.execute = AsyncMock(return_value=mock_result)

        data = UpdateProfileRequest(display_name="새 이름")
        await profile_service.update_profile(db, USER_ID, data)

        db.commit.assert_awaited_once()
        db.refresh.assert_awaited_once()

    async def test_not_found(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        data = UpdateProfileRequest(bio="새 바이오")
        with pytest.raises(NotFoundException):
            await profile_service.update_profile(db, USER_ID, data)

    async def test_update_multiple_fields(self):
        db = _make_db()
        user = _make_user()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        db.execute = AsyncMock(return_value=mock_result)

        data = UpdateProfileRequest(bio="바이오", theme="dark", bg_color="#000000")
        await profile_service.update_profile(db, USER_ID, data)

        db.commit.assert_awaited_once()

    async def test_invalid_field_raises_http_exception(self):
        """허용되지 않는 필드 → HTTPException 400"""
        from fastapi import HTTPException

        db = _make_db()
        user = _make_user()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        db.execute = AsyncMock(return_value=mock_result)

        # MagicMock으로 model_dump를 허용되지 않는 필드 반환하도록 설정
        data = MagicMock(spec=UpdateProfileRequest)
        data.model_dump.return_value = {"not_allowed_field": "value"}

        with pytest.raises(HTTPException) as exc_info:
            await profile_service.update_profile(db, USER_ID, data)
        assert exc_info.value.status_code == 400


class TestGetPublicProfile:
    async def test_success_with_links(self):
        db = _make_db()
        user = _make_user()

        link = MagicMock(spec=Link)
        link.id = uuid.uuid4()
        link.title = "링크1"
        link.url = "https://example.com"
        link.is_active = True

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = [link]

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "testuser")

        assert result["username"] == "testuser"
        assert result["theme"] == "default"
        assert len(result["links"]) == 1

    async def test_success_no_links(self):
        db = _make_db()
        user = _make_user()

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = []

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "testuser")

        assert result["links"] == []

    async def test_not_found(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(NotFoundException):
            await profile_service.get_public_profile(db, "nonexistent")
