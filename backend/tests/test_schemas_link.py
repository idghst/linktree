# 파일 목적: 링크 스키마 validator 단위 테스트
# 주요 기능: CreateLinkRequest, UpdateLinkRequest validator 경계값 테스트
# 사용 방법: pytest tests/test_schemas_link.py

import pytest
from pydantic import ValidationError
from app.schemas.link import CreateLinkRequest, UpdateLinkRequest


class TestCreateLinkRequestTitle:
    def test_title_over_100_chars_raises(self):
        """101자 제목 → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="a" * 101, url="https://example.com")

    def test_title_exactly_100_chars_ok(self):
        """100자 제목 → 통과"""
        req = CreateLinkRequest(title="a" * 100, url="https://example.com")
        assert len(req.title) == 100

    def test_title_stripped(self):
        """앞뒤 공백 제거"""
        req = CreateLinkRequest(title="  hello  ", url="https://example.com")
        assert req.title == "hello"


class TestCreateLinkRequestUrl:
    def test_javascript_url_blocked(self):
        """javascript: URL → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="test", url="javascript:alert(1)")

    def test_data_url_blocked(self):
        """data: URL → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="test", url="data:text/html,<script>")

    def test_vbscript_url_blocked(self):
        """vbscript: URL → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="test", url="vbscript:msgbox(1)")

    def test_url_over_2000_chars_raises(self):
        """2001자 URL → ValidationError"""
        long_url = "https://example.com/" + "a" * 1981
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="test", url=long_url)

    def test_url_exactly_2000_chars_ok(self):
        """2000자 URL → 통과"""
        long_url = "https://example.com/" + "a" * 1980
        req = CreateLinkRequest(title="test", url=long_url)
        assert len(req.url) == 2000


class TestCreateLinkRequestThumbnailUrl:
    def test_invalid_thumbnail_url_raises(self):
        """http(s):// 아닌 thumbnail_url → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(title="test", url="https://example.com", thumbnail_url="ftp://invalid.com")

    def test_none_thumbnail_url_ok(self):
        """None thumbnail_url → 통과"""
        req = CreateLinkRequest(title="test", url="https://example.com", thumbnail_url=None)
        assert req.thumbnail_url is None

    def test_valid_thumbnail_url_ok(self):
        """유효한 thumbnail_url → 통과"""
        req = CreateLinkRequest(title="test", url="https://example.com", thumbnail_url="https://img.com/a.jpg")
        assert req.thumbnail_url == "https://img.com/a.jpg"


class TestUpdateLinkRequestTitle:
    def test_empty_title_raises(self):
        """빈 문자열 title → ValidationError"""
        with pytest.raises(ValidationError):
            UpdateLinkRequest(title="   ")

    def test_title_over_100_chars_raises(self):
        """101자 title → ValidationError"""
        with pytest.raises(ValidationError):
            UpdateLinkRequest(title="a" * 101)

    def test_title_stripped(self):
        """앞뒤 공백 제거"""
        req = UpdateLinkRequest(title="  hello  ")
        assert req.title == "hello"

    def test_none_title_ok(self):
        """None title → 통과"""
        req = UpdateLinkRequest(title=None)
        assert req.title is None


class TestUpdateLinkRequestUrl:
    def test_javascript_url_blocked(self):
        """javascript: URL → ValidationError"""
        with pytest.raises(ValidationError):
            UpdateLinkRequest(url="javascript:alert(1)")

    def test_url_over_2000_chars_raises(self):
        """2001자 URL → ValidationError"""
        long_url = "https://example.com/" + "a" * 1981
        with pytest.raises(ValidationError):
            UpdateLinkRequest(url=long_url)

    def test_none_url_ok(self):
        """None url → 통과"""
        req = UpdateLinkRequest(url=None)
        assert req.url is None


class TestUpdateLinkRequestThumbnailUrl:
    def test_invalid_thumbnail_url_raises(self):
        """잘못된 thumbnail_url → ValidationError"""
        with pytest.raises(ValidationError):
            UpdateLinkRequest(thumbnail_url="ftp://invalid.com")

    def test_none_thumbnail_url_ok(self):
        """None → 통과"""
        req = UpdateLinkRequest(thumbnail_url=None)
        assert req.thumbnail_url is None
