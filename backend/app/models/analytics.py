# 파일 목적: 분석 데이터 모델 정의 (프로필 방문 및 링크 클릭 추적)
# 주요 기능: ProfileView - 방문 기록, LinkClick - 클릭 기록 (BigSerial PK, IP/UA 추적)
# 사용 방법: from app.models.analytics import ProfileView, LinkClick

import uuid
from datetime import datetime, timezone
from sqlalchemy import BigInteger, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, INET
from app.core.database import Base


class ProfileView(Base):
    __tablename__ = "profile_views"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    viewer_ip: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    viewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="profile_views")  # type: ignore[name-defined]


class LinkClick(Base):
    __tablename__ = "link_clicks"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    link_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("links.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    visitor_ip: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    clicked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    link: Mapped["Link"] = relationship("Link", back_populates="clicks")  # type: ignore[name-defined]
