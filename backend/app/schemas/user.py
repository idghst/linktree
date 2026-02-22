# 파일 목적: 사용자 관련 Pydantic 스키마 정의
# 주요 기능: RegisterRequest(검증), LoginRequest, UserResponse(응답)
# 사용 방법: from app.schemas.user import RegisterRequest, LoginRequest, UserResponse

import re
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str | None = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]{3,30}$", v):
            raise ValueError("username은 3-30자 영문, 숫자, 언더스코어만 허용됩니다.")
        reserved = {
            "admin", "api", "auth", "dashboard", "settings",
            "public", "static", "media", "health", "login",
            "logout", "register", "signup", "about", "help",
            "support", "terms", "privacy", "contact",
        }
        if v.lower() in reserved:
            raise ValueError(f"'{v}'는 사용할 수 없는 예약어입니다.")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 최소 8자 이상이어야 합니다.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 최소 8자 이상이어야 합니다.")
        return v


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    username: str
    email: str
    display_name: str | None
    bio: str | None
    avatar_url: str | None
    theme: str
    bg_color: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
