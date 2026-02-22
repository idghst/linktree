# 파일 목적: users 테이블에 seo_settings, links 테이블에 favicon_url 컬럼 추가 마이그레이션
# 주요 기능: seo_settings (JSONB, nullable) — SEO 메타데이터, favicon_url (TEXT, nullable) — 링크 파비콘 URL
# 사용 방법: alembic upgrade 008 또는 alembic upgrade head

"""add seo_settings and favicon_url columns

Revision ID: 008
Revises: 007
Create Date: 2026-02-22 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 이미 직접 추가된 경우를 대비해 IF NOT EXISTS 방식으로 처리
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS seo_settings JSONB")
    op.execute("ALTER TABLE links ADD COLUMN IF NOT EXISTS favicon_url TEXT")


def downgrade() -> None:
    op.drop_column("users", "seo_settings")
    op.drop_column("links", "favicon_url")
