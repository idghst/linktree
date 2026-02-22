# 파일 목적: GraphQL 컨텍스트 - JWT 파싱, DB 세션, 현재 사용자 정보 제공
# 주요 기능: get_context() → GraphQLContext(db, user_id)
# 사용 방법: strawberry schema의 context_getter로 등록

import uuid
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.fastapi import BaseContext
from app.core.security import verify_token
from app.dependencies.db import get_db


class GraphQLContext(BaseContext):
    def __init__(self, db: AsyncSession, user_id: uuid.UUID | None = None):
        self.db = db
        self.user_id = user_id


async def get_context(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> GraphQLContext:
    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        uid_str = verify_token(token, token_type="access")
        if uid_str:
            try:
                user_id = uuid.UUID(uid_str)
            except ValueError:
                pass
    return GraphQLContext(db=db, user_id=user_id)
