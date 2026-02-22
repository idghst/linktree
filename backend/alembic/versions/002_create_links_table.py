# 파일 목적: links 테이블 생성 마이그레이션 (두 번째 마이그레이션)
# 주요 기능: UUID PK, user_id FK(CASCADE), position/is_active/click_count 컬럼
# 사용 방법: alembic upgrade 002 또는 alembic upgrade head

"""create links table

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "links",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(100), nullable=False),
        sa.Column("url", sa.String(2000), nullable=False),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("click_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_links_user_id", "links", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_links_user_id", table_name="links")
    op.drop_table("links")
