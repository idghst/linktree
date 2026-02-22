# 파일 목적: 사용자 관련 GraphQL 타입 정의
# 주요 기능: UserType (User 모델 → GraphQL 타입)
# 사용 방법: from app.graphql.types.user import UserType

import uuid
import strawberry
from datetime import datetime


@strawberry.type
class UserType:
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
