# 파일 목적: 링크 CRUD 비즈니스 로직
# 주요 기능: list_links, create_link, update_link, delete_link, reorder_links, toggle_link
# 사용 방법: from app.services.link import create_link, list_links

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.link import Link
from app.schemas.link import CreateLinkRequest, UpdateLinkRequest, ReorderItem
from app.core.exceptions import NotFoundException, ForbiddenException
from fastapi import HTTPException, status

MAX_LINKS_PER_USER = 50


async def list_links(db: AsyncSession, user_id: uuid.UUID) -> list[Link]:
    result = await db.execute(
        select(Link).where(Link.user_id == user_id).order_by(Link.position)
    )
    return list(result.scalars().all())


async def create_link(db: AsyncSession, user_id: uuid.UUID, data: CreateLinkRequest) -> Link:
    # 사용자당 최대 링크 수 확인
    count_result = await db.execute(
        select(func.count(Link.id)).where(Link.user_id == user_id)
    )
    link_count = count_result.scalar() or 0
    if link_count >= MAX_LINKS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"링크는 최대 {MAX_LINKS_PER_USER}개까지 등록할 수 있습니다.",
        )

    # 현재 최대 position 조회
    result = await db.execute(
        select(func.max(Link.position)).where(Link.user_id == user_id)
    )
    max_position = result.scalar() or -1
    next_position = max_position + 1

    link = Link(
        id=uuid.uuid4(),
        user_id=user_id,
        title=data.title,
        url=data.url,
        description=data.description,
        thumbnail_url=data.thumbnail_url,
        position=next_position,
        link_type=data.link_type,
        is_sensitive=data.is_sensitive,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


async def update_link(
    db: AsyncSession,
    link_id: uuid.UUID,
    user_id: uuid.UUID,
    data: UpdateLinkRequest,
) -> Link:
    result = await db.execute(select(Link).where(Link.id == link_id))
    link = result.scalar_one_or_none()

    if not link:
        raise NotFoundException("링크를 찾을 수 없습니다.")
    if link.user_id != user_id:
        raise ForbiddenException("이 링크를 수정할 권한이 없습니다.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(link, field, value)

    await db.commit()
    await db.refresh(link)
    return link


async def delete_link(db: AsyncSession, link_id: uuid.UUID, user_id: uuid.UUID) -> None:
    result = await db.execute(select(Link).where(Link.id == link_id))
    link = result.scalar_one_or_none()

    if not link:
        raise NotFoundException("링크를 찾을 수 없습니다.")
    if link.user_id != user_id:
        raise ForbiddenException("이 링크를 삭제할 권한이 없습니다.")

    await db.delete(link)
    await db.commit()


async def reorder_links(
    db: AsyncSession,
    user_id: uuid.UUID,
    items: list[ReorderItem],
) -> list[Link]:
    for item in items:
        result = await db.execute(
            select(Link).where(Link.id == item.id, Link.user_id == user_id)
        )
        link = result.scalar_one_or_none()
        if link:
            link.position = item.position

    await db.commit()
    return await list_links(db, user_id)


async def toggle_link(db: AsyncSession, link_id: uuid.UUID, user_id: uuid.UUID) -> Link:
    result = await db.execute(select(Link).where(Link.id == link_id))
    link = result.scalar_one_or_none()

    if not link:
        raise NotFoundException("링크를 찾을 수 없습니다.")
    if link.user_id != user_id:
        raise ForbiddenException("이 링크를 수정할 권한이 없습니다.")

    link.is_active = not link.is_active
    await db.commit()
    await db.refresh(link)
    return link
