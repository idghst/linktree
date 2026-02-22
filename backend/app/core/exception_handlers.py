# 파일 목적: FastAPI 전역 예외 핸들러 등록
# 주요 기능: AppException → JSONResponse 변환, 기본 HTTP 예외 처리
# 사용 방법: from app.core.exception_handlers import register_exception_handlers

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import AppException


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        detail = "; ".join(
            f"{' -> '.join(str(loc) for loc in err['loc'])}: {err['msg']}"
            for err in errors
        )
        return JSONResponse(
            status_code=422,
            content={"detail": detail},
        )
