# 파일 목적: 서버 상태 확인 엔드포인트
# 주요 기능: GET /api/health - 서비스 정상 작동 여부 반환
# 사용 방법: app.include_router(health.router, prefix="/api")

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "service": "linktree-api"}
