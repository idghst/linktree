# 파일 목적: 링크 관리 HTTP 엔드포인트 라우터
# 주요 기능: GET/POST/PUT/DELETE /links, PUT /links/reorder, PATCH /links/{id}/toggle
# 사용 방법: app.include_router(links.router, prefix="/api/links", tags=["links"])

import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.schemas.link import CreateLinkRequest, UpdateLinkRequest, LinkResponse, ReorderItem
from app.services import link as link_service
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[LinkResponse])
async def list_links(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list:
    return await link_service.list_links(db, current_user.id)


@router.post("", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def create_link(
    data: CreateLinkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> object:
    return await link_service.create_link(db, current_user.id, data)


@router.put("/reorder", response_model=list[LinkResponse])
async def reorder_links(
    items: list[ReorderItem],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list:
    return await link_service.reorder_links(db, current_user.id, items)


@router.put("/{link_id}", response_model=LinkResponse)
async def update_link(
    link_id: uuid.UUID,
    data: UpdateLinkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> object:
    return await link_service.update_link(db, link_id, current_user.id, data)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
    link_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await link_service.delete_link(db, link_id, current_user.id)


@router.patch("/{link_id}/toggle", response_model=LinkResponse)
async def toggle_link(
    link_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> object:
    return await link_service.toggle_link(db, link_id, current_user.id)
