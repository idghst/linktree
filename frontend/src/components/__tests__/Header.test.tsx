import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Header } from '@/components/layout/Header'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { useAuth } from '@/hooks/useAuth'
const mockUseAuth = vi.mocked(useAuth)

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  display_name: '테스트',
  bio: null,
  avatar_url: null,
  theme: 'default',
  bg_color: '#ffffff',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로고 "Linktree" 텍스트를 렌더링한다', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() } as any)
    render(<Header />)
    expect(screen.getByText('Linktree')).toBeInTheDocument()
  })

  it('비로그인 상태에서 로그인 버튼을 표시한다', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() } as any)
    render(<Header />)
    expect(screen.getByText('로그인')).toBeInTheDocument()
  })

  it('비로그인 상태에서 시작하기 버튼을 표시한다', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() } as any)
    render(<Header />)
    expect(screen.getByText('시작하기')).toBeInTheDocument()
  })

  it('로그인 상태에서 대시보드 링크를 표시한다', () => {
    mockUseAuth.mockReturnValue({ user: mockUser, logout: vi.fn() } as any)
    render(<Header />)
    expect(screen.getByText('대시보드')).toBeInTheDocument()
  })

  it('로그인 상태에서 로그아웃 버튼을 표시한다', () => {
    mockUseAuth.mockReturnValue({ user: mockUser, logout: vi.fn() } as any)
    render(<Header />)
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })

  it('로그인 상태에서 로그인 버튼을 표시하지 않는다', () => {
    mockUseAuth.mockReturnValue({ user: mockUser, logout: vi.fn() } as any)
    render(<Header />)
    expect(screen.queryByText('로그인')).not.toBeInTheDocument()
  })

  it('로그아웃 버튼 클릭 시 logout을 호출한다', async () => {
    const logout = vi.fn()
    mockUseAuth.mockReturnValue({ user: mockUser, logout } as any)
    render(<Header />)
    await userEvent.click(screen.getByText('로그아웃'))
    expect(logout).toHaveBeenCalledTimes(1)
  })
})
