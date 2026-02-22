# 파일 목적: links 테이블에 description, thumbnail_url 컬럼 추가 마이그레이션
# 주요 기능: description (TEXT nullable), thumbnail_url (TEXT nullable) 필드 추가
# 사용 방법: alembic upgrade 004 또는 alembic upgrade head

"""add link description and thumbnail_url

Revision ID: 004
Revises: 003
Create Date: 2024-01-01 00:03:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("links", sa.Column("description", sa.Text, nullable=True))
    op.add_column("links", sa.Column("thumbnail_url", sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column("links", "thumbnail_url")
    op.drop_column("links", "description")
