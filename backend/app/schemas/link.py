# 파일 목적: 링크 CRUD Pydantic 스키마 정의
# 주요 기능: CreateLinkRequest, UpdateLinkRequest, LinkResponse, ReorderItem (예약 공개, 민감 콘텐츠, 링크 타입, favicon 포함)
# 사용 방법: from app.schemas.link import CreateLinkRequest, LinkResponse

import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator

_VALID_LINK_TYPES = {"link", "header"}


class CreateLinkRequest(BaseModel):
    title: str
    url: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    is_sensitive: bool = False
    link_type: str = "link"

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if len(v.strip()) == 0:
            raise ValueError("제목은 비어있을 수 없습니다.")
        if len(v) > 100:
            raise ValueError("제목은 100자 이하여야 합니다.")
        return v.strip()

    @field_validator("link_type")
    @classmethod
    def validate_link_type(cls, v: str) -> str:
        if v not in _VALID_LINK_TYPES:
            raise ValueError(f"link_type은 {sorted(_VALID_LINK_TYPES)} 중 하나여야 합니다.")
        return v

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        blocked = ("javascript:", "data:", "vbscript:")
        if any(v.lower().startswith(s) for s in blocked):
            raise ValueError("허용되지 않는 URL 스키마입니다.")
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL은 http:// 또는 https://로 시작해야 합니다.")
        if len(v) > 2000:
            raise ValueError("URL은 2000자 이하여야 합니다.")
        return v

    @field_validator("thumbnail_url")
    @classmethod
    def validate_thumbnail_url(cls, v: str | None) -> str | None:
        if v is not None and not v.startswith(("http://", "https://")):
            raise ValueError("썸네일 URL은 http:// 또는 https://로 시작해야 합니다.")
        return v

    @model_validator(mode="after")
    def validate_schedule_and_url(self) -> "CreateLinkRequest":
        if self.scheduled_start and self.scheduled_end:
            if self.scheduled_end <= self.scheduled_start:
                raise ValueError("scheduled_end must be after scheduled_start")
        if self.link_type == "link" and not self.url:
            raise ValueError("link_type이 'link'이면 url은 필수입니다.")
        return self


class UpdateLinkRequest(BaseModel):
    title: str | None = None
    url: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    is_active: bool | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    is_sensitive: bool | None = None
    link_type: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError("제목은 비어있을 수 없습니다.")
            if len(v) > 100:
                raise ValueError("제목은 100자 이하여야 합니다.")
            return v.strip()
        return v

    @field_validator("link_type")
    @classmethod
    def validate_link_type(cls, v: str | None) -> str | None:
        if v is not None and v not in _VALID_LINK_TYPES:
            raise ValueError(f"link_type은 {sorted(_VALID_LINK_TYPES)} 중 하나여야 합니다.")
        return v

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        if v is not None:
            blocked = ("javascript:", "data:", "vbscript:")
            if any(v.lower().startswith(s) for s in blocked):
                raise ValueError("허용되지 않는 URL 스키마입니다.")
            if not v.startswith(("http://", "https://")):
                raise ValueError("URL은 http:// 또는 https://로 시작해야 합니다.")
            if len(v) > 2000:
                raise ValueError("URL은 2000자 이하여야 합니다.")
        return v

    @field_validator("thumbnail_url")
    @classmethod
    def validate_thumbnail_url(cls, v: str | None) -> str | None:
        if v is not None and not v.startswith(("http://", "https://")):
            raise ValueError("썸네일 URL은 http:// 또는 https://로 시작해야 합니다.")
        return v

    @model_validator(mode="after")
    def validate_schedule(self) -> "UpdateLinkRequest":
        if self.scheduled_start and self.scheduled_end:
            if self.scheduled_end <= self.scheduled_start:
                raise ValueError("scheduled_end must be after scheduled_start")
        return self


class LinkResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    url: str | None
    description: str | None
    thumbnail_url: str | None
    position: int
    is_active: bool
    click_count: int
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    is_sensitive: bool = False
    link_type: str = "link"
    favicon_url: str | None = None
    created_at: datetime
    updated_at: datetime


class ReorderItem(BaseModel):
    id: uuid.UUID
    position: int
