# 파일 목적: analytics 서비스 단위 테스트
# 주요 기능: get_summary, get_link_stats, get_view_stats, get_top_links, get_recent_clicks
# 사용 방법: pytest tests/test_services_analytics.py

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from app.services import analytics as analytics_service

USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def _make_db():
    db = MagicMock()
    return db


class TestGetSummary:
    async def test_default_values(self):
        """데이터 없을 때 기본값(0) 반환"""
        db = _make_db()

        click_mock = MagicMock()
        click_mock.one.return_value = MagicMock(total_clicks=None, total_links=None)

        today_mock = MagicMock()
        today_mock.scalar.return_value = None

        view_mock = MagicMock()
        view_mock.one.return_value = MagicMock(total_views=None, today_views=None)

        db.execute = AsyncMock(side_effect=[click_mock, today_mock, view_mock])

        result = await analytics_service.get_summary(db, USER_ID)

        assert result.total_clicks == 0
        assert result.total_views == 0
        assert result.total_links == 0
        assert result.today_clicks == 0
        assert result.today_views == 0
        assert result.click_through_rate == 0.0

    async def test_ctr_calculation(self):
        """CTR = total_clicks / total_views * 100"""
        db = _make_db()

        click_mock = MagicMock()
        click_mock.one.return_value = MagicMock(total_clicks=50, total_links=5)

        today_mock = MagicMock()
        today_mock.scalar.return_value = 5

        view_mock = MagicMock()
        view_mock.one.return_value = MagicMock(total_views=100, today_views=10)

        db.execute = AsyncMock(side_effect=[click_mock, today_mock, view_mock])

        result = await analytics_service.get_summary(db, USER_ID)

        assert result.total_clicks == 50
        assert result.total_views == 100
        assert result.total_links == 5
        assert result.today_clicks == 5
        assert result.today_views == 10
        assert result.click_through_rate == 50.0

    async def test_zero_views_no_division_error(self):
        """방문 0일 때 CTR = 0.0 (ZeroDivisionError 없음)"""
        db = _make_db()

        click_mock = MagicMock()
        click_mock.one.return_value = MagicMock(total_clicks=10, total_links=2)

        today_mock = MagicMock()
        today_mock.scalar.return_value = 0

        view_mock = MagicMock()
        view_mock.one.return_value = MagicMock(total_views=0, today_views=0)

        db.execute = AsyncMock(side_effect=[click_mock, today_mock, view_mock])

        result = await analytics_service.get_summary(db, USER_ID)

        assert result.click_through_rate == 0.0


class TestGetLinkStats:
    async def test_empty_list(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_link_stats(db, USER_ID)

        assert result == []

    async def test_returns_link_analytics(self):
        db = _make_db()
        link = MagicMock()
        link.id = uuid.uuid4()
        link.title = "링크1"
        link.url = "https://example.com"
        link.click_count = 10
        link.is_active = True

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [link]
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_link_stats(db, USER_ID)

        assert len(result) == 1
        assert result[0].click_count == 10
        assert result[0].title == "링크1"


class TestGetViewStats:
    async def test_default_7_days(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_view_stats(db, USER_ID)

        assert result.days == 7
        assert len(result.daily) == 7
        assert result.total_views == 0

    async def test_custom_30_days(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_view_stats(db, USER_ID, days=30)

        assert result.days == 30
        assert len(result.daily) == 30

    async def test_daily_zeros_when_no_data(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_view_stats(db, USER_ID, days=3)

        for day in result.daily:
            assert day.view_count == 0
            assert day.unique_visitors == 0

    async def test_with_actual_row_data(self):
        """실제 DB row 데이터가 있을 때 → 날짜별 집계 반영"""
        from datetime import datetime, timezone, date
        db = _make_db()
        today = datetime.now(timezone.utc).date()

        mock_row = MagicMock()
        mock_row.view_date = today
        mock_row.view_count = 5
        mock_row.unique_visitors = 3

        mock_result = MagicMock()
        mock_result.all.return_value = [mock_row]
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_view_stats(db, USER_ID, days=1)
        assert result.total_views == 5
        today_data = next((d for d in result.daily if d.date == today), None)
        assert today_data is not None
        assert today_data.view_count == 5
        assert today_data.unique_visitors == 3


class TestGetTopLinks:
    async def test_no_views_ctr_is_zero(self):
        """방문 없을 때 CTR = 0.0"""
        db = _make_db()

        view_mock = MagicMock()
        view_mock.scalar.return_value = 0

        link = MagicMock()
        link.id = uuid.uuid4()
        link.title = "링크1"
        link.url = "https://example.com"
        link.click_count = 5

        links_mock = MagicMock()
        links_mock.scalars.return_value.all.return_value = [link]

        db.execute = AsyncMock(side_effect=[view_mock, links_mock])

        result = await analytics_service.get_top_links(db, USER_ID)

        assert len(result) == 1
        assert result[0].ctr == 0.0

    async def test_ctr_with_views(self):
        """CTR 계산 정확성 검증"""
        db = _make_db()

        view_mock = MagicMock()
        view_mock.scalar.return_value = 100

        link = MagicMock()
        link.id = uuid.uuid4()
        link.title = "링크1"
        link.url = "https://example.com"
        link.click_count = 25

        links_mock = MagicMock()
        links_mock.scalars.return_value.all.return_value = [link]

        db.execute = AsyncMock(side_effect=[view_mock, links_mock])

        result = await analytics_service.get_top_links(db, USER_ID)

        assert result[0].ctr == 25.0

    async def test_empty_links(self):
        db = _make_db()

        view_mock = MagicMock()
        view_mock.scalar.return_value = 0

        links_mock = MagicMock()
        links_mock.scalars.return_value.all.return_value = []

        db.execute = AsyncMock(side_effect=[view_mock, links_mock])

        result = await analytics_service.get_top_links(db, USER_ID)

        assert result == []


class TestGetRecentClicks:
    async def test_ipv4_masking(self):
        """IPv4 마지막 옥텟을 * 로 마스킹"""
        db = _make_db()
        click = MagicMock()
        click.link_id = uuid.uuid4()
        click.clicked_at = datetime.now(timezone.utc)
        click.visitor_ip = "192.168.1.100"

        mock_result = MagicMock()
        mock_result.all.return_value = [(click, "링크 제목")]
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_recent_clicks(db, USER_ID)

        assert len(result) == 1
        assert result[0].visitor_ip == "192.168.1.*"
        assert result[0].title == "링크 제목"

    async def test_ipv6_masking(self):
        """IPv6 마지막 3자리를 *** 로 마스킹"""
        db = _make_db()
        click = MagicMock()
        click.link_id = uuid.uuid4()
        click.clicked_at = datetime.now(timezone.utc)
        click.visitor_ip = "2001:db8::1"

        mock_result = MagicMock()
        mock_result.all.return_value = [(click, "링크")]
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_recent_clicks(db, USER_ID)

        assert result[0].visitor_ip is not None
        assert result[0].visitor_ip.endswith("***")

    async def test_none_ip(self):
        """IP 없을 때 None 반환"""
        db = _make_db()
        click = MagicMock()
        click.link_id = uuid.uuid4()
        click.clicked_at = datetime.now(timezone.utc)
        click.visitor_ip = None

        mock_result = MagicMock()
        mock_result.all.return_value = [(click, "링크")]
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_recent_clicks(db, USER_ID)

        assert result[0].visitor_ip is None

    async def test_empty_results(self):
        db = _make_db()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        result = await analytics_service.get_recent_clicks(db, USER_ID)

        assert result == []
