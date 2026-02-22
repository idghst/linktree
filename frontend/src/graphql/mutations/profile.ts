// 파일 목적: 프로필 관련 GraphQL Mutation 문자열 정의
// 주요 기능: UPDATE_PROFILE_MUTATION
// 사용 방법: import { UPDATE_PROFILE_MUTATION } from "@/graphql/mutations/profile"

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
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
