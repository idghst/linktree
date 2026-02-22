# 파일 목적: link 서비스 단위 테스트
# 주요 기능: list_links, create_link, update_link, delete_link, reorder_links, toggle_link
# 사용 방법: pytest tests/test_services_link.py

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.link import Link
from app.schemas.link import CreateLinkRequest, ReorderItem, UpdateLinkRequest
from app.services import link as link_service

USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
OTHER_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
LINK_ID = uuid.UUID("00000000-0000-0000-0000-000000000003")


def _make_link(user_id=USER_ID, link_id=LINK_ID, is_active=True, position=0):
    link = MagicMock(spec=Link)
    link.id = link_id
    link.user_id = user_id
    link.title = "테스트 링크"
    link.url = "https://example.com"
    link.description = None
    link.thumbnail_url = None
    link.position = position
    link.is_active = is_active
    link.click_count = 0
    return link


def _make_db():
    db = MagicMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.delete = AsyncMock()
    return db


class TestListLinks:
    async def test_empty_list(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        result = await link_service.list_links(db, USER_ID)

        assert result == []

    async def test_returns_links(self):
        db = _make_db()
        links = [_make_link(), _make_link(link_id=uuid.uuid4())]
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = links
        db.execute = AsyncMock(return_value=mock_result)

        result = await link_service.list_links(db, USER_ID)

        assert len(result) == 2


class TestCreateLink:
    async def test_create_success(self):
        db = _make_db()
        count_mock = MagicMock()
        count_mock.scalar.return_value = 0
        max_pos_mock = MagicMock()
        max_pos_mock.scalar.return_value = None
        db.execute = AsyncMock(side_effect=[count_mock, max_pos_mock])

        data = CreateLinkRequest(title="새 링크", url="https://example.com")
        await link_service.create_link(db, USER_ID, data)

        db.add.assert_called_once()
        db.commit.assert_awaited_once()
        db.refresh.assert_awaited_once()

    async def test_create_exceeds_limit(self):
        db = _make_db()
        count_mock = MagicMock()
        count_mock.scalar.return_value = 50
        db.execute = AsyncMock(return_value=count_mock)

        data = CreateLinkRequest(title="새 링크", url="https://example.com")
        with pytest.raises(HTTPException) as exc_info:
            await link_service.create_link(db, USER_ID, data)

        assert exc_info.value.status_code == 400


class TestUpdateLink:
    async def test_update_success(self):
        db = _make_db()
        link = _make_link()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        data = UpdateLinkRequest(title="수정된 제목")
        await link_service.update_link(db, LINK_ID, USER_ID, data)

        db.commit.assert_awaited_once()
        db.refresh.assert_awaited_once()

    async def test_update_not_found(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        data = UpdateLinkRequest(title="수정")
        with pytest.raises(NotFoundException):
            await link_service.update_link(db, LINK_ID, USER_ID, data)

    async def test_update_forbidden(self):
        db = _make_db()
        link = _make_link(user_id=OTHER_USER_ID)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        data = UpdateLinkRequest(title="수정")
        with pytest.raises(ForbiddenException):
            await link_service.update_link(db, LINK_ID, USER_ID, data)


class TestDeleteLink:
    async def test_delete_success(self):
        db = _make_db()
        link = _make_link()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        await link_service.delete_link(db, LINK_ID, USER_ID)

        db.delete.assert_awaited_once_with(link)
        db.commit.assert_awaited_once()

    async def test_delete_not_found(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(NotFoundException):
            await link_service.delete_link(db, LINK_ID, USER_ID)

    async def test_delete_forbidden(self):
        db = _make_db()
        link = _make_link(user_id=OTHER_USER_ID)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(ForbiddenException):
            await link_service.delete_link(db, LINK_ID, USER_ID)


class TestReorderLinks:
    async def test_reorder_success(self):
        db = _make_db()
        link1_id = uuid.UUID("00000000-0000-0000-0000-000000000010")
        link2_id = uuid.UUID("00000000-0000-0000-0000-000000000011")
        link1 = _make_link(link_id=link1_id, position=0)
        link2 = _make_link(link_id=link2_id, position=1)

        r1 = MagicMock()
        r1.scalar_one_or_none.return_value = link1
        r2 = MagicMock()
        r2.scalar_one_or_none.return_value = link2
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [link2, link1]

        db.execute = AsyncMock(side_effect=[r1, r2, list_result])

        items = [
            ReorderItem(id=link1_id, position=1),
            ReorderItem(id=link2_id, position=0),
        ]
        result = await link_service.reorder_links(db, USER_ID, items)

        assert link1.position == 1
        assert link2.position == 0
        db.commit.assert_awaited_once()
        assert len(result) == 2


class TestToggleLink:
    async def test_toggle_active_to_inactive(self):
        db = _make_db()
        link = _make_link(is_active=True)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        await link_service.toggle_link(db, LINK_ID, USER_ID)

        assert link.is_active is False
        db.commit.assert_awaited_once()

    async def test_toggle_inactive_to_active(self):
        db = _make_db()
        link = _make_link(is_active=False)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        await link_service.toggle_link(db, LINK_ID, USER_ID)

        assert link.is_active is True

    async def test_toggle_not_found(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(NotFoundException):
            await link_service.toggle_link(db, LINK_ID, USER_ID)

    async def test_toggle_forbidden(self):
        db = _make_db()
        link = _make_link(user_id=OTHER_USER_ID)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = link
        db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(ForbiddenException):
            await link_service.toggle_link(db, LINK_ID, USER_ID)
