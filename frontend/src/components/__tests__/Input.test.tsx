import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('input 엘리먼트를 렌더링한다', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('label을 렌더링한다', () => {
    render(<Input label="이메일" />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByText('이메일')).toBeInTheDocument()
  })

  it('error 메시지를 렌더링한다', () => {
    render(<Input error="이메일을 입력해주세요" />)
    expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
  })

  it('error 상태에서 빨간색 테두리 클래스를 적용한다', () => {
    render(<Input error="오류" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('값을 입력할 수 있다', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello')
    expect(input).toHaveValue('hello')
  })

  it('onChange 핸들러를 호출한다', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('placeholder를 렌더링한다', () => {
    render(<Input placeholder="이메일을 입력하세요" />)
    expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument()
  })

  it('disabled 상태를 지원한다', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
