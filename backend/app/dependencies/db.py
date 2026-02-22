# 파일 목적: FastAPI 데이터베이스 세션 의존성
# 주요 기능: 요청마다 AsyncSession 생성 후 자동 close (yield 패턴)
# 사용 방법: async def endpoint(db: AsyncSession = Depends(get_db)):

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:  # pragma: no cover
        try:  # pragma: no cover
            yield session  # pragma: no cover
        finally:  # pragma: no cover
            await session.close()  # pragma: no cover
