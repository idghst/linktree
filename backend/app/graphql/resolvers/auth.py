# 파일 목적: 인증 GraphQL resolver (Query + Mutation)
# 주요 기능: me(Query), login/register/refreshToken/changePassword/deleteAccount(Mutation)
# 사용 방법: AuthQuery, AuthMutation을 schema.py에서 조합

import uuid
import strawberry
from strawberry.types import Info
from sqlalchemy import select

from app.graphql.context import GraphQLContext
from app.graphql.types.user import UserType
from app.graphql.types.auth import TokenType
from app.graphql.inputs.user import RegisterInput, LoginInput, ChangePasswordInput, RefreshTokenInput
from app.schemas.user import RegisterRequest, LoginRequest, ChangePasswordRequest
from app.schemas.token import TokenResponse
from app.services import auth as auth_service
from app.core.exceptions import AppException
from app.models.user import User


def _require_auth(info: Info) -> uuid.UUID:
    if info.context.user_id is None:
        raise strawberry.exceptions.GraphQLError("인증이 필요합니다.")
    return info.context.user_id


def _user_to_type(user: User) -> UserType:
    return UserType(
        id=user.id,
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        theme=user.theme,
        bg_color=user.bg_color,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def _token_to_type(token: TokenResponse) -> TokenType:
    return TokenType(
        access_token=token.access_token,
        refresh_token=token.refresh_token,
        token_type=token.token_type,
    )


@strawberry.type
class AuthQuery:
    @strawberry.field
    async def me(self, info: Info[GraphQLContext, None]) -> UserType:
        user_id = _require_auth(info)
        result = await info.context.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise strawberry.exceptions.GraphQLError("사용자를 찾을 수 없습니다.")
        return _user_to_type(user)


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def register(self, input: RegisterInput, info: Info[GraphQLContext, None]) -> UserType:
        try:
            data = RegisterRequest(
                username=input.username,
                email=input.email,
                password=input.password,
                display_name=input.display_name,
            )
            user = await auth_service.register(info.context.db, data)
            return _user_to_type(user)
        except AppException as e:
            raise strawberry.exceptions.GraphQLError(e.detail)
        except Exception as e:
            raise strawberry.exceptions.GraphQLError(str(e))

    @strawberry.mutation
    async def login(self, input: LoginInput, info: Info[GraphQLContext, None]) -> TokenType:
        try:
            data = LoginRequest(email=input.email, password=input.password)
            token = await auth_service.login(info.context.db, data)
            return _token_to_type(token)
        except AppException as e:
            raise strawberry.exceptions.GraphQLError(e.detail)

    @strawberry.mutation
    async def refresh_token(self, input: RefreshTokenInput, info: Info[GraphQLContext, None]) -> TokenType:
        try:
            token = await auth_service.refresh_token(info.context.db, input.refresh_token)
            return _token_to_type(token)
        except AppException as e:
            raise strawberry.exceptions.GraphQLError(e.detail)

    @strawberry.mutation
    async def change_password(self, input: ChangePasswordInput, info: Info[GraphQLContext, None]) -> bool:
        user_id = _require_auth(info)
        result = await info.context.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise strawberry.exceptions.GraphQLError("사용자를 찾을 수 없습니다.")
        try:
            data = ChangePasswordRequest(
                current_password=input.current_password,
                new_password=input.new_password,
            )
            await auth_service.change_password(info.context.db, user, data)
            return True
        except AppException as e:
            raise strawberry.exceptions.GraphQLError(e.detail)
        except Exception as e:
            raise strawberry.exceptions.GraphQLError(str(e))

    @strawberry.mutation
    async def delete_account(self, info: Info[GraphQLContext, None]) -> bool:
        user_id = _require_auth(info)
        result = await info.context.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise strawberry.exceptions.GraphQLError("사용자를 찾을 수 없습니다.")
        await auth_service.delete_account(info.context.db, user)
        return True
