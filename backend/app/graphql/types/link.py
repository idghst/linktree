# 파일 목적: 링크 관련 GraphQL 타입 정의
# 주요 기능: LinkType (Link 모델 → GraphQL 타입)
# 사용 방법: from app.graphql.types.link import LinkType

import uuid
import strawberry
from datetime import datetime


@strawberry.type
class LinkType:
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    url: str | None
    description: str | None
    thumbnail_url: str | None
    favicon_url: str | None
    position: int
    is_active: bool
    click_count: int
    scheduled_start: datetime | None
    scheduled_end: datetime | None
    is_sensitive: bool
    link_type: str
    created_at: datetime
    updated_at: datetime
