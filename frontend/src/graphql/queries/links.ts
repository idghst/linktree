// 파일 목적: 링크 관련 GraphQL Query 문자열 정의
// 주요 기능: LINKS_QUERY
// 사용 방법: import { LINKS_QUERY } from "@/graphql/queries/links"

export const LINKS_QUERY = `
  query Links {
    links {
      id
      userId
      title
      url
      description
      thumbnailUrl
      faviconUrl
      position
      isActive
      clickCount
      scheduledStart
      scheduledEnd
      isSensitive
      linkType
      createdAt
      updatedAt
    }
  }
`;
