// 파일 목적: 프로필 관련 GraphQL Query 문자열 정의
// 주요 기능: MY_PROFILE_QUERY
// 사용 방법: import { MY_PROFILE_QUERY } from "@/graphql/queries/profile"

export const MY_PROFILE_QUERY = `
  query MyProfile {
    myProfile {
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
