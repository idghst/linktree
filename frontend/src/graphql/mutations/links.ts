// 파일 목적: 링크 관련 GraphQL Mutation 문자열 정의
// 주요 기능: CREATE_LINK_MUTATION, UPDATE_LINK_MUTATION, DELETE_LINK_MUTATION, REORDER_LINKS_MUTATION, TOGGLE_LINK_MUTATION
// 사용 방법: import { CREATE_LINK_MUTATION } from "@/graphql/mutations/links"

export const CREATE_LINK_MUTATION = `
  mutation CreateLink($input: CreateLinkInput!) {
    createLink(input: $input) {
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

export const UPDATE_LINK_MUTATION = `
  mutation UpdateLink($linkId: UUID!, $input: UpdateLinkInput!) {
    updateLink(linkId: $linkId, input: $input) {
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

export const DELETE_LINK_MUTATION = `
  mutation DeleteLink($linkId: UUID!) {
    deleteLink(linkId: $linkId)
  }
`;

export const REORDER_LINKS_MUTATION = `
  mutation ReorderLinks($items: [ReorderItemInput!]!) {
    reorderLinks(items: $items) {
      id
      userId
      title
      url
      position
      isActive
      clickCount
      linkType
      createdAt
      updatedAt
    }
  }
`;

export const TOGGLE_LINK_MUTATION = `
  mutation ToggleLink($linkId: UUID!) {
    toggleLink(linkId: $linkId) {
      id
      userId
      title
      url
      position
      isActive
      clickCount
      linkType
      createdAt
      updatedAt
    }
  }
`;
