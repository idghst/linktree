// 파일 목적: 인증 관련 GraphQL Mutation 문자열 정의
// 주요 기능: REGISTER_MUTATION, LOGIN_MUTATION, REFRESH_TOKEN_MUTATION, CHANGE_PASSWORD_MUTATION, DELETE_ACCOUNT_MUTATION
// 사용 방법: import { LOGIN_MUTATION } from "@/graphql/mutations/auth"

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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

export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      tokenType
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      tokenType
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const DELETE_ACCOUNT_MUTATION = `
  mutation DeleteAccount {
    deleteAccount
  }
`;
