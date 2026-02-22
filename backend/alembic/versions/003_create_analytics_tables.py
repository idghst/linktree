# 파일 목적: 분석 테이블 생성 마이그레이션 (세 번째 마이그레이션)
# 주요 기능: profile_views, link_clicks 테이블 - BigSerial PK, IP/UA 추적
# 사용 방법: alembic upgrade 003 또는 alembic upgrade head

"""create analytics tables

Revision ID: 003
Revises: 002
Create Date: 2024-01-01 00:02:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, INET

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profile_views",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("viewer_ip", INET, nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("viewed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_profile_views_user_id", "profile_views", ["user_id"])

    op.create_table(
        "link_clicks",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("link_id", UUID(as_uuid=True), sa.ForeignKey("links.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("visitor_ip", INET, nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("clicked_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_link_clicks_link_id", "link_clicks", ["link_id"])
    op.create_index("ix_link_clicks_user_id", "link_clicks", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_link_clicks_user_id", table_name="link_clicks")
    op.drop_index("ix_link_clicks_link_id", table_name="link_clicks")
    op.drop_table("link_clicks")
    op.drop_index("ix_profile_views_user_id", table_name="profile_views")
    op.drop_table("profile_views")
