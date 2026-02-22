# 파일 목적: GraphQL 스키마 조합 및 FastAPI 라우터 생성
# 주요 기능: Query/Mutation 통합, strawberry FastAPI 라우터 생성
# 사용 방법: from app.graphql.schema import graphql_router

import strawberry
from strawberry.fastapi import GraphQLRouter

from app.graphql.context import get_context
from app.graphql.resolvers.auth import AuthQuery, AuthMutation
from app.graphql.resolvers.links import LinksQuery, LinksMutation
from app.graphql.resolvers.profile import ProfileQuery, ProfileMutation
from app.graphql.resolvers.analytics import AnalyticsQuery


@strawberry.type
class Query(AuthQuery, LinksQuery, ProfileQuery, AnalyticsQuery):
    pass


@strawberry.type
class Mutation(AuthMutation, LinksMutation, ProfileMutation):
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)

graphql_router = GraphQLRouter(schema, context_getter=get_context)
