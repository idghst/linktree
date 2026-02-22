# 파일 목적: 사용자 관련 GraphQL Input 타입 정의
# 주요 기능: RegisterInput, LoginInput, ChangePasswordInput, RefreshTokenInput
# 사용 방법: from app.graphql.inputs.user import RegisterInput, LoginInput

import strawberry


@strawberry.input
class RegisterInput:
    username: str
    email: str
    password: str
    display_name: str | None = None


@strawberry.input
class LoginInput:
    email: str
    password: str


@strawberry.input
class ChangePasswordInput:
    current_password: str
    new_password: str


@strawberry.input
class RefreshTokenInput:
    refresh_token: str
