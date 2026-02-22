# 파일 목적: 링크 관련 GraphQL resolver (Query + Mutation)
# 주요 기능: links(Query), createLink/updateLink/deleteLink/reorderLinks/toggleLink(Mutation)
# 사용 방법: LinksQuery, LinksMutation을 schema.py에서 조합

import uuid
import strawberry
from strawberry.types import Info
from fastapi import HTTPException

from app.graphql.context import GraphQLContext
from app.graphql.types.link import LinkType
from app.graphql.inputs.link import CreateLinkInput, UpdateLinkInput, ReorderItemInput
from app.schemas.link import CreateLinkRequest, UpdateLinkRequest, ReorderItem
from app.services import link as link_service
from app.core.exceptions import AppException


def _require_auth(info: Info) -> uuid.UUID:
    if info.context.user_id is None:
        raise strawberry.exceptions.GraphQLError("인증이 필요합니다.")
    return info.context.user_id


def _link_to_type(link) -> LinkType:
    return LinkType(
        id=link.id,
        user_id=link.user_id,
        title=link.title,
        url=link.url,
        description=link.description,
        thumbnail_url=link.thumbnail_url,
        favicon_url=link.favicon_url,
        position=link.position,
        is_active=link.is_active,
        click_count=link.click_count,
        scheduled_start=link.scheduled_start,
        scheduled_end=link.scheduled_end,
        is_sensitive=link.is_sensitive,
        link_type=link.link_type,
        created_at=link.created_at,
        updated_at=link.updated_at,
    )


@strawberry.type
class LinksQuery:
    @strawberry.field
    async def links(self, info: Info[GraphQLContext, None]) -> list[LinkType]:
        user_id = _require_auth(info)
        links = await link_service.list_links(info.context.db, user_id)
        return [_link_to_type(lnk) for lnk in links]


@strawberry.type
class LinksMutation:
    @strawberry.mutation
    async def create_link(self, input: CreateLinkInput, info: Info[GraphQLContext, None]) -> LinkType:
        user_id = _require_auth(info)
        try:
            data = CreateLinkRequest(
                title=input.title,
                url=input.url,
                description=input.description,
                thumbnail_url=input.thumbnail_url,
                scheduled_start=input.scheduled_start,
                scheduled_end=input.scheduled_end,
                is_sensitive=input.is_sensitive,
                link_type=input.link_type,
            )
            link = await link_service.create_link(info.context.db, user_id, data)
            return _link_to_type(link)
        except (AppException, HTTPException) as e:
            detail = e.detail if hasattr(e, "detail") else str(e)
            raise strawberry.exceptions.GraphQLError(detail)
        except Exception as e:
            raise strawberry.exceptions.GraphQLError(str(e))

    @strawberry.mutation
    async def update_link(
        self, link_id: uuid.UUID, input: UpdateLinkInput, info: Info[GraphQLContext, None]
    ) -> LinkType:
        user_id = _require_auth(info)
        try:
            data = UpdateLinkRequest(
                title=input.title,
                url=input.url,
                description=input.description,
                thumbnail_url=input.thumbnail_url,
                is_active=input.is_active,
                scheduled_start=input.scheduled_start,
                scheduled_end=input.scheduled_end,
                is_sensitive=input.is_sensitive,
                link_type=input.link_type,
            )
            link = await link_service.update_link(info.context.db, link_id, user_id, data)
            return _link_to_type(link)
        except (AppException, HTTPException) as e:
            detail = e.detail if hasattr(e, "detail") else str(e)
            raise strawberry.exceptions.GraphQLError(detail)

    @strawberry.mutation
    async def delete_link(self, link_id: uuid.UUID, info: Info[GraphQLContext, None]) -> bool:
        user_id = _require_auth(info)
        try:
            await link_service.delete_link(info.context.db, link_id, user_id)
            return True
        except (AppException, HTTPException) as e:
            detail = e.detail if hasattr(e, "detail") else str(e)
            raise strawberry.exceptions.GraphQLError(detail)

    @strawberry.mutation
    async def reorder_links(
        self, items: list[ReorderItemInput], info: Info[GraphQLContext, None]
    ) -> list[LinkType]:
        user_id = _require_auth(info)
        pydantic_items = [ReorderItem(id=item.id, position=item.position) for item in items]
        links = await link_service.reorder_links(info.context.db, user_id, pydantic_items)
        return [_link_to_type(lnk) for lnk in links]

    @strawberry.mutation
    async def toggle_link(self, link_id: uuid.UUID, info: Info[GraphQLContext, None]) -> LinkType:
        user_id = _require_auth(info)
        try:
            link = await link_service.toggle_link(info.context.db, link_id, user_id)
            return _link_to_type(link)
        except (AppException, HTTPException) as e:
            detail = e.detail if hasattr(e, "detail") else str(e)
            raise strawberry.exceptions.GraphQLError(detail)
