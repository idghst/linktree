# 파일 목적: 프로필 관련 GraphQL Input 타입 정의
# 주요 기능: UpdateProfileInput
# 사용 방법: from app.graphql.inputs.profile import UpdateProfileInput

import strawberry


@strawberry.input
class UpdateProfileInput:
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    theme: str | None = None
    bg_color: str | None = None
