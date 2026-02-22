# 파일 목적: 프로필 관련 GraphQL resolver (Query + Mutation)
# 주요 기능: myProfile(Query), updateProfile(Mutation)
# 사용 방법: ProfileQuery, ProfileMutation을 schema.py에서 조합

import uuid
import strawberry
from strawberry.types import Info
from fastapi import HTTPException

from app.graphql.context import GraphQLContext
from app.graphql.types.user import UserType
from app.graphql.inputs.profile import UpdateProfileInput
from app.schemas.profile import UpdateProfileRequest
from app.services import profile as profile_service
from app.core.exceptions import AppException


def _require_auth(info: Info) -> uuid.UUID:
    if info.context.user_id is None:
        raise strawberry.exceptions.GraphQLError("인증이 필요합니다.")
    return info.context.user_id


def _user_to_type(user) -> UserType:
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


@strawberry.type
class ProfileQuery:
    @strawberry.field
    async def my_profile(self, info: Info[GraphQLContext, None]) -> UserType:
        user_id = _require_auth(info)
        try:
            user = await profile_service.get_my_profile(info.context.db, user_id)
            return _user_to_type(user)
        except AppException as e:
            raise strawberry.exceptions.GraphQLError(e.detail)


@strawberry.type
class ProfileMutation:
    @strawberry.mutation
    async def update_profile(
        self, input: UpdateProfileInput, info: Info[GraphQLContext, None]
    ) -> UserType:
        user_id = _require_auth(info)
        try:
            data = UpdateProfileRequest(
                display_name=input.display_name,
                bio=input.bio,
                avatar_url=input.avatar_url,
                theme=input.theme,
                bg_color=input.bg_color,
            )
            user = await profile_service.update_profile(info.context.db, user_id, data)
            return _user_to_type(user)
        except (AppException, HTTPException) as e:
            detail = e.detail if hasattr(e, "detail") else str(e)
            raise strawberry.exceptions.GraphQLError(detail)
        except Exception as e:
            raise strawberry.exceptions.GraphQLError(str(e))
