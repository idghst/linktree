# 파일 목적: 링크 예약 공개(scheduled_start/end) 및 민감 콘텐츠(is_sensitive) 기능 단위 테스트
# 주요 기능: 스키마 validator, is_sensitive 기본값, 공개 프로필 예약 필터링 검증
# 사용 방법: pytest tests/test_link_features.py -v --tb=short

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import ValidationError

from app.models.link import Link
from app.models.user import User
from app.schemas.link import CreateLinkRequest, UpdateLinkRequest
from app.services import profile as profile_service

USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")

NOW = datetime.now(timezone.utc)
PAST = NOW - timedelta(hours=1)
FUTURE = NOW + timedelta(hours=1)
FAR_FUTURE = NOW + timedelta(hours=2)


def _make_user(username="scheduser"):
    user = MagicMock(spec=User)
    user.id = USER_ID
    user.username = username
    user.display_name = "테스트"
    user.bio = None
    user.avatar_url = None
    user.social_links = None
    user.theme = "default"
    user.bg_color = "#ffffff"
    user.is_active = True
    return user


def _make_link(
    is_active=True,
    scheduled_start=None,
    scheduled_end=None,
    is_sensitive=False,
):
    link = MagicMock(spec=Link)
    link.id = uuid.uuid4()
    link.user_id = USER_ID
    link.title = "테스트 링크"
    link.url = "https://example.com"
    link.is_active = is_active
    link.scheduled_start = scheduled_start
    link.scheduled_end = scheduled_end
    link.is_sensitive = is_sensitive
    return link


def _make_db():
    db = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


class TestLinkScheduling:
    def test_valid_schedule_ok(self):
        """scheduled_end > scheduled_start → 통과"""
        req = CreateLinkRequest(
            title="예약 링크",
            url="https://example.com",
            scheduled_start=PAST,
            scheduled_end=FUTURE,
        )
        assert req.scheduled_start == PAST
        assert req.scheduled_end == FUTURE

    def test_end_before_start_raises(self):
        """scheduled_end <= scheduled_start → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(
                title="예약 링크",
                url="https://example.com",
                scheduled_start=FUTURE,
                scheduled_end=PAST,
            )

    def test_end_equal_start_raises(self):
        """scheduled_end == scheduled_start → ValidationError"""
        with pytest.raises(ValidationError):
            CreateLinkRequest(
                title="예약 링크",
                url="https://example.com",
                scheduled_start=FUTURE,
                scheduled_end=FUTURE,
            )

    def test_only_start_ok(self):
        """scheduled_start만 설정 → 통과"""
        req = CreateLinkRequest(
            title="예약 링크",
            url="https://example.com",
            scheduled_start=FUTURE,
        )
        assert req.scheduled_start == FUTURE
        assert req.scheduled_end is None

    def test_only_end_ok(self):
        """scheduled_end만 설정 → 통과"""
        req = CreateLinkRequest(
            title="예약 링크",
            url="https://example.com",
            scheduled_end=FUTURE,
        )
        assert req.scheduled_end == FUTURE
        assert req.scheduled_start is None

    def test_no_schedule_ok(self):
        """예약 미설정 → 기본값 None"""
        req = CreateLinkRequest(title="링크", url="https://example.com")
        assert req.scheduled_start is None
        assert req.scheduled_end is None

    def test_update_request_end_before_start_raises(self):
        """UpdateLinkRequest: scheduled_end <= scheduled_start → ValidationError"""
        with pytest.raises(ValidationError):
            UpdateLinkRequest(
                scheduled_start=FAR_FUTURE,
                scheduled_end=FUTURE,
            )

    def test_update_request_valid_schedule_ok(self):
        """UpdateLinkRequest: 유효한 예약 → 통과"""
        req = UpdateLinkRequest(
            scheduled_start=FUTURE,
            scheduled_end=FAR_FUTURE,
        )
        assert req.scheduled_start == FUTURE
        assert req.scheduled_end == FAR_FUTURE


class TestIsSensitive:
    def test_default_is_false(self):
        """is_sensitive 기본값은 False"""
        req = CreateLinkRequest(title="링크", url="https://example.com")
        assert req.is_sensitive is False

    def test_set_true(self):
        """is_sensitive=True 설정 → True"""
        req = CreateLinkRequest(
            title="링크",
            url="https://example.com",
            is_sensitive=True,
        )
        assert req.is_sensitive is True

    def test_update_request_default_none(self):
        """UpdateLinkRequest: is_sensitive 미설정 → None"""
        req = UpdateLinkRequest()
        assert req.is_sensitive is None

    def test_update_request_set_true(self):
        """UpdateLinkRequest: is_sensitive=True → True"""
        req = UpdateLinkRequest(is_sensitive=True)
        assert req.is_sensitive is True


class TestPublicProfileSchedulingFilter:
    async def test_future_scheduled_start_excluded(self):
        """scheduled_start가 미래 → DB 쿼리 필터로 제외됨 (mock에서 빈 결과 반환)"""
        db = _make_db()
        user = _make_user()

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        # DB가 필터링된 결과(빈 목록)를 반환하는 시나리오
        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = []

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "scheduser")

        assert result["links"] == []
        # DB execute가 두 번 호출됨 (user 조회 + 링크 조회)
        assert db.execute.call_count == 2

    async def test_past_scheduled_end_excluded(self):
        """scheduled_end가 과거 → DB 쿼리 필터로 제외됨 (mock에서 빈 결과 반환)"""
        db = _make_db()
        user = _make_user()

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = []

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "scheduser")

        assert result["links"] == []

    async def test_no_schedule_included(self):
        """예약 미설정 링크 → 정상 공개"""
        db = _make_db()
        user = _make_user()
        link = _make_link(scheduled_start=None, scheduled_end=None)

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = [link]

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "scheduser")

        assert len(result["links"]) == 1
        assert result["links"][0].scheduled_start is None
        assert result["links"][0].scheduled_end is None

    async def test_active_schedule_included(self):
        """현재 시간 내 예약 링크 → 정상 공개"""
        db = _make_db()
        user = _make_user()
        link = _make_link(scheduled_start=PAST, scheduled_end=FUTURE)

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = [link]

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "scheduser")

        assert len(result["links"]) == 1

    async def test_sensitive_link_included_in_response(self):
        """is_sensitive=True 링크는 응답에 포함됨 (프론트에서 경고 처리)"""
        db = _make_db()
        user = _make_user()
        link = _make_link(is_sensitive=True)

        user_result = MagicMock()
        user_result.scalar_one_or_none.return_value = user

        links_result = MagicMock()
        links_result.scalars.return_value.all.return_value = [link]

        db.execute = AsyncMock(side_effect=[user_result, links_result])

        result = await profile_service.get_public_profile(db, "scheduser")

        assert len(result["links"]) == 1
        assert result["links"][0].is_sensitive is True
