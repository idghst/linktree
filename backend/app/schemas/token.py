# 파일 목적: JWT 토큰 관련 Pydantic 스키마 정의
# 주요 기능: TokenResponse(access+refresh), RefreshRequest
# 사용 방법: from app.schemas.token import TokenResponse, RefreshRequest

from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
