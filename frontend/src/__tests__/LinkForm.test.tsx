// 파일 목적: 링크 폼 새 기능(is_sensitive, scheduled_start/end) 테스트
// 주요 기능: is_sensitive 체크박스, scheduled_start/end datetime 필드 렌더링 확인
// 사용 방법: vitest run

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// LinksPage를 직접 렌더링하면 useApi 등 훅 모킹이 필요하므로
// LinkForm은 내부 함수라 직접 import 불가 — 모달 경유로 테스트

// useApi 모킹
vi.mock('@/hooks/useApi', () => ({
  useApi: () => ({ data: [], loading: false, refetch: vi.fn() }),
}))

// linksService 모킹
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

describe('LinkForm - 새 기능 필드 렌더링', () => {
  it('링크 추가 모달을 열면 is_sensitive 체크박스가 렌더링된다', async () => {
    render(<LinksPage />)
    await userEvent.click(screen.getAllByRole('button', { name: /링크 추가/ })[0])
    expect(screen.getByLabelText('민감한 콘텐츠')).toBeInTheDocument()
    expect(screen.getByLabelText('민감한 콘텐츠')).toHaveAttribute('type', 'checkbox')
  })

  it('링크 추가 모달을 열면 scheduled_start datetime-local 필드가 렌더링된다', async () => {
    render(<LinksPage />)
    await userEvent.click(screen.getAllByRole('button', { name: /링크 추가/ })[0])
    expect(screen.getByLabelText(/공개 시작 시간/)).toBeInTheDocument()
    expect(screen.getByLabelText(/공개 시작 시간/)).toHaveAttribute('type', 'datetime-local')
  })

  it('링크 추가 모달을 열면 scheduled_end datetime-local 필드가 렌더링된다', async () => {
    render(<LinksPage />)
    await userEvent.click(screen.getAllByRole('button', { name: /링크 추가/ })[0])
    expect(screen.getByLabelText(/공개 종료 시간/)).toBeInTheDocument()
    expect(screen.getByLabelText(/공개 종료 시간/)).toHaveAttribute('type', 'datetime-local')
  })
})
