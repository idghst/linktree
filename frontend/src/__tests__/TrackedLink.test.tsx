// 파일 목적: TrackedLink 컴포넌트 - is_sensitive 경고 모달 동작 테스트
// 주요 기능: is_sensitive=true 링크 클릭 시 경고 모달 표시, 취소/계속 버튼 동작 확인
// 사용 방법: vitest run

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrackedLink } from '@/app/[username]/TrackedLink'
import type { Link } from '@/types/api'

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

describe('TrackedLink - is_sensitive=false (일반 링크)', () => {
  it('클릭 시 경고 모달을 표시하지 않고 바로 이동한다', async () => {
    render(<TrackedLink link={baseLink} />)
    await userEvent.click(screen.getByRole('link'))
    expect(screen.queryByText(/민감한 콘텐츠/)).not.toBeInTheDocument()
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
  })
})

describe('TrackedLink - is_sensitive=true (민감한 링크)', () => {
  const sensitiveLink: Link = { ...baseLink, is_sensitive: true }

  it('클릭 시 경고 모달이 표시된다', async () => {
    render(<TrackedLink link={sensitiveLink} />)
    await userEvent.click(screen.getByRole('link'))
    expect(screen.getByText(/민감한 콘텐츠를 포함할 수 있습니다/)).toBeInTheDocument()
  })

  it('경고 모달에서 취소 클릭 시 모달이 닫히고 이동하지 않는다', async () => {
    render(<TrackedLink link={sensitiveLink} />)
    await userEvent.click(screen.getByRole('link'))
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByText(/민감한 콘텐츠를 포함할 수 있습니다/)).not.toBeInTheDocument()
    expect(window.open).not.toHaveBeenCalled()
  })

  it('경고 모달에서 계속 클릭 시 클릭 추적 후 이동한다', async () => {
    render(<TrackedLink link={sensitiveLink} />)
    await userEvent.click(screen.getByRole('link'))
    await userEvent.click(screen.getByRole('button', { name: '계속' }))
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
    expect(screen.queryByText(/민감한 콘텐츠를 포함할 수 있습니다/)).not.toBeInTheDocument()
  })
})
