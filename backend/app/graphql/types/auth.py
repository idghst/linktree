# 파일 목적: 인증 토큰 GraphQL 타입 정의
# 주요 기능: TokenType (access_token, refresh_token)
# 사용 방법: from app.graphql.types.auth import TokenType

import strawberry


@strawberry.type
class TokenType:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
