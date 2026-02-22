// 파일 목적: link_type 기능 테스트 - 헤더/링크 구분선 렌더링 확인
// 주요 기능: header 타입 링크는 구분선으로 렌더링, 헤더 추가 버튼 존재 확인
// 사용 방법: vitest run

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Link } from '@/types/api'

const headerLink: Link = {
  id: 'header-1',
  user_id: 'user-1',
  title: '소셜 링크',
  url: '',
  position: 0,
  is_active: true,
  click_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  link_type: 'header',
}

vi.mock('@/hooks/useApi', () => ({
  useApi: () => ({ data: [headerLink], loading: false, refetch: vi.fn() }),
}))

vi.mock('@/services/links', () => ({
  linksService: {
    createLink: vi.fn(),
    updateLink: vi.fn(),
    deleteLink: vi.fn(),
    toggleLink: vi.fn(),
    reorderLinks: vi.fn(),
  },
}))

import userEvent from '@testing-library/user-event'
import LinksPage from '@/app/dashboard/links/page'

describe('LinkType - 헤더 타입 링크', () => {
  it('헤더 추가 버튼이 렌더링된다', () => {
    render(<LinksPage />)
    expect(screen.getByRole('button', { name: /헤더 추가/ })).toBeInTheDocument()
  })

  it('link_type=header인 링크는 구분선 스타일로 제목이 표시된다', () => {
    render(<LinksPage />)
    expect(screen.getByText('소셜 링크')).toBeInTheDocument()
  })

  it('링크 추가 모달을 열면 유형 라디오 버튼이 렌더링된다', async () => {
    render(<LinksPage />)
    await userEvent.click(screen.getByRole('button', { name: /링크 추가/ }))
    expect(screen.getByDisplayValue('link')).toBeInTheDocument()
    expect(screen.getByDisplayValue('header')).toBeInTheDocument()
  })

  it('헤더 추가 버튼 클릭 시 헤더 타입이 선택된 모달이 열린다', async () => {
    render(<LinksPage />)
    await userEvent.click(screen.getByRole('button', { name: /헤더 추가/ }))
    const headerRadio = screen.getByDisplayValue('header') as HTMLInputElement
    expect(headerRadio.checked).toBe(true)
  })

  it('헤더 유형 선택 시 URL 필드가 숨겨진다', async () => {
    render(<LinksPage />)
    await userEvent.click(screen.getByRole('button', { name: /링크 추가/ }))
    await userEvent.click(screen.getByDisplayValue('header'))
    expect(screen.queryByLabelText(/URL/)).not.toBeInTheDocument()
  })
})
