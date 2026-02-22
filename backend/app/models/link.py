# 파일 목적: 링크 데이터베이스 모델 정의
# 주요 기능: Link 테이블 - UUID PK, user_id FK, title/url/position/is_active/click_count/description/thumbnail_url/scheduled_start/scheduled_end/is_sensitive/link_type/favicon_url
# 사용 방법: from app.models.link import Link

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Link(Base):
    __tablename__ = "links"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    click_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    scheduled_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_sensitive: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    link_type: Mapped[str] = mapped_column(String(20), default="link", nullable=False)
    favicon_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="links")  # type: ignore[name-defined]
    clicks: Mapped[list["LinkClick"]] = relationship(  # type: ignore[name-defined]
        "LinkClick", back_populates="link", cascade="all, delete-orphan"
    )
