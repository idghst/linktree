# 파일 목적: 프로필 관련 Pydantic 스키마 정의
# 주요 기능: UpdateProfileRequest, ProfileResponse, PublicProfileResponse (공개 프로필 + 링크 + 소셜 링크 + SEO 포함)
# 사용 방법: from app.schemas.profile import UpdateProfileRequest, PublicProfileResponse

import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.schemas.link import LinkResponse

_ALLOWED_SOCIAL_KEYS = {
    "github", "twitter", "instagram", "youtube",
    "linkedin", "tiktok", "facebook",
}


class UpdateProfileRequest(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    social_links: dict | None = None
    theme: str | None = None
    bg_color: str | None = None
    seo_settings: dict | None = None

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("bio는 500자 이하여야 합니다.")
        return v

    @field_validator("social_links")
    @classmethod
    def validate_social_links(cls, v: dict | None) -> dict | None:
        if v is None:
            return v
        invalid_keys = set(v.keys()) - _ALLOWED_SOCIAL_KEYS
        if invalid_keys:
            raise ValueError(
                f"허용되지 않는 소셜 플랫폼 키입니다: {sorted(invalid_keys)}. "
                f"허용 목록: {sorted(_ALLOWED_SOCIAL_KEYS)}"
            )
        return v


class ProfileResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    username: str
    email: str
    display_name: str | None
    bio: str | None
    avatar_url: str | None
    social_links: dict | None
    seo_settings: dict | None = None
    theme: str
    bg_color: str
    created_at: datetime
    updated_at: datetime


class PublicProfileResponse(BaseModel):
    username: str
    display_name: str | None
    bio: str | None
    avatar_url: str | None
    social_links: dict | None
    seo_settings: dict | None = None
    theme: str
    bg_color: str
    links: list[LinkResponse] = []
