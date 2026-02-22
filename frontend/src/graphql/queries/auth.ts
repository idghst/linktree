// 파일 목적: 인증 관련 GraphQL Query 문자열 정의
// 주요 기능: ME_QUERY
// 사용 방법: import { ME_QUERY } from "@/graphql/queries/auth"

export const ME_QUERY = `
  query Me {
    me {
      id
      username
      email
      displayName
      bio
      avatarUrl
      theme
      bgColor
      isActive
      createdAt
      updatedAt
    }
  }
`;
