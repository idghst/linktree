# 파일 목적: 사용자 데이터베이스 모델 정의
# 주요 기능: User 테이블 - UUID PK, username/email unique, bcrypt 해시, 테마 설정, 소셜 링크
# 사용 방법: from app.models.user import User

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social_links: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    seo_settings: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    theme: Mapped[str] = mapped_column(String(50), default="default", nullable=False)
    bg_color: Mapped[str] = mapped_column(String(7), default="#ffffff", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    links: Mapped[list["Link"]] = relationship(  # type: ignore[name-defined]
        "Link", back_populates="user", cascade="all, delete-orphan"
    )
    profile_views: Mapped[list["ProfileView"]] = relationship(  # type: ignore[name-defined]
        "ProfileView", back_populates="user", cascade="all, delete-orphan"
    )
