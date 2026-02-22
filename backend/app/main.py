# 파일 목적: FastAPI 애플리케이션 진입점 및 라우터 등록
# 주요 기능: lifespan 컨텍스트, CORS 미들웨어, GraphQL + REST public 라우터 마운트
# 사용 방법: uvicorn app.main:app --host 0.0.0.0 --port 8000

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exception_handlers import register_exception_handlers
from app.routers import health, public
from app.graphql.schema import graphql_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # 시작 시 초기화 작업
    yield  # pragma: no cover
    # 종료 시 정리 작업


app = FastAPI(
    title="Linktree API",
    description="바이오 링크 페이지 서비스 API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(health.router, prefix="/api")
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(graphql_router, prefix="/graphql")
