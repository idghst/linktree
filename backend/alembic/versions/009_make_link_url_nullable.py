# 파일 목적: links 테이블의 url 컬럼 NOT NULL 제약 제거
# 주요 기능: url 컬럼을 nullable로 변경 — link_type="header"인 링크는 url이 불필요
# 사용 방법: alembic upgrade 009 또는 alembic upgrade head

"""make link url nullable

Revision ID: 009
Revises: 008
Create Date: 2026-02-22 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "009"
down_revision: Union[str, None] = "008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE links ALTER COLUMN url DROP NOT NULL")


def downgrade() -> None:
    op.execute("ALTER TABLE links ALTER COLUMN url SET NOT NULL")
