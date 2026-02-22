// 파일 목적: favicon_url 기능 테스트 - 링크 카드에 파비콘 아이콘 표시 확인
// 주요 기능: favicon_url 있으면 img 표시, 없으면 img 없음 확인
// 사용 방법: vitest run

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrackedLink } from '@/app/[username]/TrackedLink'
import type { Link } from '@/types/api'

// alt=""인 img는 role="presentation"이므로 querySelector로 탐색
function getFaviconImg(container: HTMLElement) {
  return container.querySelector('img[width="16"]')
}

const baseLink: Link = {
  id: 'link-1',
  user_id: 'user-1',
  title: '테스트 링크',
  url: 'https://example.com',
  position: 0,
  is_active: true,
  click_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({}))
  vi.stubGlobal('open', vi.fn())
})

describe('FaviconUrl - 링크 아이콘 표시', () => {
  it('favicon_url이 있으면 img 아이콘이 렌더링된다', () => {
    const linkWithFavicon: Link = {
      ...baseLink,
      favicon_url: 'https://example.com/favicon.ico',
    }
    const { container } = render(<TrackedLink link={linkWithFavicon} />)
    const img = getFaviconImg(container)
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/favicon.ico')
    expect(img).toHaveAttribute('width', '16')
    expect(img).toHaveAttribute('height', '16')
  })

  it('favicon_url이 없으면 img 아이콘이 렌더링되지 않는다', () => {
    const { container } = render(<TrackedLink link={baseLink} />)
    expect(getFaviconImg(container)).toBeNull()
  })

  it('favicon_url이 null이면 img 아이콘이 렌더링되지 않는다', () => {
    const linkWithNullFavicon: Link = { ...baseLink, favicon_url: null }
    const { container } = render(<TrackedLink link={linkWithNullFavicon} />)
    expect(getFaviconImg(container)).toBeNull()
  })
})

describe('FaviconUrl - 대시보드 링크 카드', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('dashboard에서 favicon_url이 있는 링크 카드에 아이콘이 표시된다', async () => {
    const linkWithFavicon: Link = {
      ...baseLink,
      favicon_url: 'https://example.com/favicon.ico',
    }

    vi.doMock('@/hooks/useApi', () => ({
      useApi: () => ({ data: [linkWithFavicon], loading: false, refetch: vi.fn() }),
    }))
    vi.doMock('@/services/links', () => ({
      linksService: {
        createLink: vi.fn(),
        updateLink: vi.fn(),
        deleteLink: vi.fn(),
        toggleLink: vi.fn(),
        reorderLinks: vi.fn(),
      },
    }))

    const { default: LinksPage } = await import('@/app/dashboard/links/page')
    const { container } = render(<LinksPage />)
    const img = getFaviconImg(container)
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/favicon.ico')
  })

  it('dashboard에서 favicon_url이 없는 링크 카드에는 아이콘이 없다', async () => {
    vi.doMock('@/hooks/useApi', () => ({
      useApi: () => ({ data: [baseLink], loading: false, refetch: vi.fn() }),
    }))
    vi.doMock('@/services/links', () => ({
      linksService: {
        createLink: vi.fn(),
        updateLink: vi.fn(),
        deleteLink: vi.fn(),
        toggleLink: vi.fn(),
        reorderLinks: vi.fn(),
      },
    }))

    const { default: LinksPage } = await import('@/app/dashboard/links/page')
    const { container } = render(<LinksPage />)
    expect(getFaviconImg(container)).toBeNull()
  })
})
