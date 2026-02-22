# 파일 목적: 링크 관련 GraphQL Input 타입 정의
# 주요 기능: CreateLinkInput, UpdateLinkInput, ReorderItemInput
# 사용 방법: from app.graphql.inputs.link import CreateLinkInput

import uuid
import strawberry
from datetime import datetime


@strawberry.input
class CreateLinkInput:
    title: str
    url: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    is_sensitive: bool = False
    link_type: str = "link"


@strawberry.input
class UpdateLinkInput:
    title: str | None = None
    url: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    is_active: bool | None = None
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    is_sensitive: bool | None = None
    link_type: str | None = None


@strawberry.input
class ReorderItemInput:
    id: uuid.UUID
    position: int
