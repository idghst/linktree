import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

let mockPathname = '/dashboard'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { username: 'testuser' } }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('DashboardSidebar', () => {
  beforeEach(() => {
    mockPathname = '/dashboard'
  })

  it('모든 네비게이션 아이템을 렌더링한다', () => {
    render(<DashboardSidebar />)
    expect(screen.getByText('개요')).toBeInTheDocument()
    expect(screen.getByText('링크 관리')).toBeInTheDocument()
    expect(screen.getByText('프로필 설정')).toBeInTheDocument()
  })

  it('5개의 네비게이션 링크를 렌더링한다', () => {
    render(<DashboardSidebar />)
    expect(screen.getAllByRole('link')).toHaveLength(5)
  })

  it('/dashboard 경로에서 개요 링크가 활성화된다', () => {
    render(<DashboardSidebar />)
    const activeLink = screen.getByText('개요').closest('a')
    expect(activeLink).toHaveClass('bg-violet-50')
    expect(activeLink).toHaveClass('text-violet-700')
  })

  it('/dashboard 경로에서 링크 관리 링크는 비활성화된다', () => {
    render(<DashboardSidebar />)
    const inactiveLink = screen.getByText('링크 관리').closest('a')
    expect(inactiveLink).not.toHaveClass('bg-violet-50')
  })

  it('/dashboard/links 경로에서 링크 관리 링크가 활성화된다', () => {
    mockPathname = '/dashboard/links'
    render(<DashboardSidebar />)
    const activeLink = screen.getByText('링크 관리').closest('a')
    expect(activeLink).toHaveClass('bg-violet-50')
  })

  it('/dashboard/profile 경로에서 프로필 설정 링크가 활성화된다', () => {
    mockPathname = '/dashboard/profile'
    render(<DashboardSidebar />)
    const activeLink = screen.getByText('프로필 설정').closest('a')
    expect(activeLink).toHaveClass('bg-violet-50')
  })

  it('링크들이 올바른 href를 가진다', () => {
    render(<DashboardSidebar />)
    expect(screen.getByText('개요').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('링크 관리').closest('a')).toHaveAttribute('href', '/dashboard/links')
    expect(screen.getByText('프로필 설정').closest('a')).toHaveAttribute('href', '/dashboard/profile')
  })
})
