# 파일 목적: links 테이블에 예약 공개 및 민감 콘텐츠 필드 추가 마이그레이션
# 주요 기능: scheduled_start, scheduled_end (TIMESTAMP WITH TIME ZONE), is_sensitive (BOOLEAN) 컬럼 추가
# 사용 방법: alembic upgrade 006 또는 alembic upgrade head

"""add link scheduling and sensitive flag

Revision ID: 006
Revises: 005
Create Date: 2024-01-01 00:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "links",
        sa.Column("scheduled_start", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "links",
        sa.Column("scheduled_end", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "links",
        sa.Column("is_sensitive", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("links", "is_sensitive")
    op.drop_column("links", "scheduled_end")
    op.drop_column("links", "scheduled_start")
