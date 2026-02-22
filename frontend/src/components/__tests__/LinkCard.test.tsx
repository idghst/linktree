import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LinkCard } from '@/components/ui/LinkCard'
import type { Link } from '@/types/api'

const mockLink: Link = {
  id: '1',
  user_id: 'user-1',
  title: '내 블로그',
  url: 'https://www.example.com/blog',
  description: null,
  thumbnail_url: null,
  position: 0,
  is_active: true,
  click_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('LinkCard', () => {
  it('링크 제목을 렌더링한다', () => {
    render(<LinkCard link={mockLink} />)
    expect(screen.getByText('내 블로그')).toBeInTheDocument()
  })

  it('URL 도메인을 표시한다', () => {
    render(<LinkCard link={mockLink} />)
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('click_count > 0이면 클릭 수를 표시한다', () => {
    const linkWithClicks: Link = { ...mockLink, click_count: 42 }
    render(<LinkCard link={linkWithClicks} />)
    expect(screen.getByText('클릭 42회')).toBeInTheDocument()
  })

  it('click_count = 0이면 클릭 수를 표시하지 않는다', () => {
    render(<LinkCard link={mockLink} />)
    expect(screen.queryByText(/클릭.*회/)).not.toBeInTheDocument()
  })

  it('is_active=false이면 opacity-50 클래스를 적용한다', () => {
    const inactiveLink: Link = { ...mockLink, is_active: false }
    render(<LinkCard link={inactiveLink} />)
    const anchor = screen.getByRole('link')
    expect(anchor).toHaveClass('opacity-50')
  })

  it('is_active=false이면 제목에 line-through 클래스를 적용한다', () => {
    const inactiveLink: Link = { ...mockLink, is_active: false }
    render(<LinkCard link={inactiveLink} />)
    expect(screen.getByText('내 블로그')).toHaveClass('line-through')
  })

  it('onClick 핸들러를 호출한다', async () => {
    const onClick = vi.fn()
    // window.open mock
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<LinkCard link={mockLink} onClick={onClick} />)
    await userEvent.click(screen.getByRole('link'))
    expect(onClick).toHaveBeenCalledTimes(1)
    openSpy.mockRestore()
  })

  it('href 속성이 링크 URL로 설정된다', () => {
    render(<LinkCard link={mockLink} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://www.example.com/blog')
  })
})
