# 파일 목적: users 테이블에 social_links 컬럼 추가 마이그레이션
# 주요 기능: social_links JSONB 컬럼 추가 - 소셜 링크 딕셔너리 저장 (예: {"github": "...", "twitter": "..."})
# 사용 방법: alembic upgrade 005 또는 alembic upgrade head

"""add social_links to users

Revision ID: 005
Revises: 004
Create Date: 2024-01-01 00:04:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("social_links", JSONB, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "social_links")
