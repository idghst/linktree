import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>저장</Button>)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('클릭 이벤트를 호출한다', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>클릭</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서 클릭이 동작하지 않는다', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>버튼</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading 상태에서 disabled 처리된다', () => {
    render(<Button loading>로딩</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('variant="danger" 클래스를 적용한다', () => {
    render(<Button variant="danger">삭제</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-500')
  })

  it('variant="secondary" 클래스를 적용한다', () => {
    render(<Button variant="secondary">취소</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100')
  })

  it('size="lg" 클래스를 적용한다', () => {
    render(<Button size="lg">큰 버튼</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6')
  })

  it('size="sm" 클래스를 적용한다', () => {
    render(<Button size="sm">작은 버튼</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3')
  })
})
