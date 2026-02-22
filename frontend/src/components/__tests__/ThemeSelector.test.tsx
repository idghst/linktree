import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeSelector } from '@/components/ui/ThemeSelector'

describe('ThemeSelector', () => {
  it('모든 테마 레이블을 렌더링한다', () => {
    render(<ThemeSelector value="#ffffff" onChange={vi.fn()} />)
    expect(screen.getByText('기본')).toBeInTheDocument()
    expect(screen.getByText('다크')).toBeInTheDocument()
    expect(screen.getByText('보라')).toBeInTheDocument()
    expect(screen.getByText('초록')).toBeInTheDocument()
    expect(screen.getByText('선셋')).toBeInTheDocument()
  })

  it('5개의 테마 버튼을 렌더링한다', () => {
    render(<ThemeSelector value="#ffffff" onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('테마 클릭 시 해당 bgColor로 onChange를 호출한다', async () => {
    const onChange = vi.fn()
    render(<ThemeSelector value="#ffffff" onChange={onChange} />)
    await userEvent.click(screen.getByText('다크').closest('button')!)
    expect(onChange).toHaveBeenCalledWith('#1a1a2e')
  })

  it('선셋 테마 클릭 시 올바른 bgColor를 전달한다', async () => {
    const onChange = vi.fn()
    render(<ThemeSelector value="#ffffff" onChange={onChange} />)
    await userEvent.click(screen.getByText('선셋').closest('button')!)
    expect(onChange).toHaveBeenCalledWith('#ea580c')
  })

  it('현재 선택된 테마에 ring-violet-500 클래스를 적용한다', () => {
    render(<ThemeSelector value="#ffffff" onChange={vi.fn()} />)
    const defaultButton = screen.getByText('기본').closest('button')
    expect(defaultButton).toHaveClass('ring-violet-500')
  })

  it('선택되지 않은 테마에는 ring-violet-500이 없다', () => {
    render(<ThemeSelector value="#ffffff" onChange={vi.fn()} />)
    const darkButton = screen.getByText('다크').closest('button')
    expect(darkButton).not.toHaveClass('ring-violet-500')
  })

  it('다크 테마 선택 시 해당 버튼에 ring-violet-500을 적용한다', () => {
    render(<ThemeSelector value="#1a1a2e" onChange={vi.fn()} />)
    const darkButton = screen.getByText('다크').closest('button')
    expect(darkButton).toHaveClass('ring-violet-500')
  })
})
