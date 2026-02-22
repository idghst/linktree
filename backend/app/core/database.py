# 파일 목적: 비동기 데이터베이스 엔진 및 세션 설정
# 주요 기능: AsyncEngine, AsyncSessionLocal, Base(DeclarativeBase) 제공
# 사용 방법: from app.core.database import AsyncSessionLocal, Base

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
