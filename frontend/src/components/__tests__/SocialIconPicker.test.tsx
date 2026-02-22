import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SocialIconPicker } from '@/components/ui/SocialIconPicker'
import type { SocialLinks } from '@/types/api'

describe('SocialIconPicker', () => {
  const emptyValue: SocialLinks = {}

  it('모든 소셜 플랫폼 레이블을 렌더링한다', () => {
    render(<SocialIconPicker value={emptyValue} onChange={vi.fn()} />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Twitter / X')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('YouTube')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('TikTok')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
  })

  it('기존 값을 input에 표시한다', () => {
    const value: SocialLinks = { github: 'https://github.com/user' }
    render(<SocialIconPicker value={value} onChange={vi.fn()} />)
    const githubInput = screen.getByPlaceholderText('https://github.com/username')
    expect(githubInput).toHaveValue('https://github.com/user')
  })

  it('input 변경 시 onChange를 호출한다', async () => {
    const onChange = vi.fn()
    render(<SocialIconPicker value={emptyValue} onChange={onChange} />)
    const githubInput = screen.getByPlaceholderText('https://github.com/username')
    await userEvent.type(githubInput, 'h')
    expect(onChange).toHaveBeenCalled()
  })

  it('입력 시 해당 플랫폼 키가 포함된 객체로 onChange를 호출한다', async () => {
    const onChange = vi.fn()
    render(<SocialIconPicker value={emptyValue} onChange={onChange} />)
    const githubInput = screen.getByPlaceholderText('https://github.com/username')
    await userEvent.type(githubInput, 'h')
    expect(onChange).toHaveBeenLastCalledWith({ github: 'h' })
  })

  it('7개의 플랫폼 URL 입력 필드를 렌더링한다', () => {
    render(<SocialIconPicker value={emptyValue} onChange={vi.fn()} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(7)
  })
})
