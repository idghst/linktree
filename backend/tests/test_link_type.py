# 파일 목적: link_type (링크/헤더 구분선) 기능 단위 테스트
# 주요 기능: header 생성, link 생성, 잘못된 link_type, header에서 url 없어도 됨, link에서 url 필수
# 사용 방법: pytest tests/test_link_type.py -v --tb=short

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import ValidationError

from app.models.link import Link
from app.schemas.link import CreateLinkRequest, UpdateLinkRequest, LinkResponse


def _make_link(link_type: str = "link", url: str | None = "https://example.com") -> MagicMock:
    link = MagicMock(spec=Link)
    link.id = uuid.uuid4()
    link.user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    link.title = "테스트"
    link.url = url
    link.description = None
    link.thumbnail_url = None
    link.position = 0
    link.is_active = True
    link.click_count = 0
    link.scheduled_start = None
    link.scheduled_end = None
    link.is_sensitive = False
    link.link_type = link_type
    link.favicon_url = None
    from datetime import datetime, timezone
    link.created_at = datetime.now(timezone.utc)
    link.updated_at = datetime.now(timezone.utc)
    return link


class TestCreateLinkRequestLinkType:
    def test_default_link_type_is_link(self):
        """link_type 미지정 시 기본값 'link'"""
        req = CreateLinkRequest(title="링크", url="https://example.com")
        assert req.link_type == "link"

    def test_link_type_link_requires_url(self):
        """link_type='link'이고 url 미설정 → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="링크", link_type="link")

    def test_link_type_link_with_url_ok(self):
        """link_type='link'이고 url 설정 → 통과"""
        req = CreateLinkRequest(title="링크", url="https://example.com", link_type="link")
        assert req.link_type == "link"
        assert req.url == "https://example.com"

    def test_link_type_header_without_url_ok(self):
        """link_type='header'이면 url 없어도 통과"""
        req = CreateLinkRequest(title="섹션 제목", link_type="header")
        assert req.link_type == "header"
        assert req.url is None

    def test_link_type_header_with_url_ok(self):
        """link_type='header'이면 url 있어도 통과"""
        req = CreateLinkRequest(title="섹션", link_type="header", url="https://example.com")
        assert req.link_type == "header"

    def test_invalid_link_type_raises(self):
        """link_type='invalid' → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="링크", url="https://example.com", link_type="invalid")

    def test_invalid_link_type_button_raises(self):
        """link_type='button' 등 허용되지 않는 값 → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="링크", url="https://example.com", link_type="button")


class TestUpdateLinkRequestLinkType:
    def test_update_link_type_default_none(self):
        """UpdateLinkRequest: link_type 미설정 → None"""
        req = UpdateLinkRequest()
        assert req.link_type is None

    def test_update_link_type_header_ok(self):
        """UpdateLinkRequest: link_type='header' → 통과"""
        req = UpdateLinkRequest(link_type="header")
        assert req.link_type == "header"

    def test_update_link_type_link_ok(self):
        """UpdateLinkRequest: link_type='link' → 통과"""
        req = UpdateLinkRequest(link_type="link")
        assert req.link_type == "link"

    def test_update_invalid_link_type_raises(self):
        """UpdateLinkRequest: link_type='bad' → ValidationError"""
        with pytest.raises(ValidationError):
            UpdateLinkRequest(link_type="bad")


class TestLinkResponseLinkType:
    def test_link_response_includes_link_type(self):
        """LinkResponse에 link_type 필드 포함"""
        link = _make_link(link_type="header", url=None)
        resp = LinkResponse.model_validate(link)
        assert resp.link_type == "header"
        assert resp.url is None

    def test_link_response_default_link_type(self):
        """LinkResponse: link_type 기본값 'link'"""
        link = _make_link(link_type="link", url="https://example.com")
        resp = LinkResponse.model_validate(link)
        assert resp.link_type == "link"
        assert resp.url == "https://example.com"
