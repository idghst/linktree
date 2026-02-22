# 파일 목적: links 테이블에 link_type 컬럼 추가 마이그레이션
# 주요 기능: link_type (VARCHAR, default="link") 컬럼 추가 — "link" 또는 "header" 값
# 사용 방법: alembic upgrade 007 또는 alembic upgrade head

"""add link_type column

Revision ID: 007
Revises: 006
Create Date: 2024-01-01 00:06:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "links",
        sa.Column(
            "link_type",
            sa.String(20),
            nullable=False,
            server_default="link",
        ),
    )


def downgrade() -> None:
    op.drop_column("links", "link_type")
