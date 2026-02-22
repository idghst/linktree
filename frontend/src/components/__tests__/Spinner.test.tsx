import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from '@/components/ui/Spinner'

describe('Spinner', () => {
  it('렌더링된다', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('animate-spin 클래스를 가진다', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toHaveClass('animate-spin')
  })

  it('기본 크기(md)에서 h-6 클래스를 적용한다', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toHaveClass('h-6')
  })

  it('size="sm" 클래스를 적용한다', () => {
    const { container } = render(<Spinner size="sm" />)
    expect(container.firstChild).toHaveClass('h-4')
  })

  it('size="lg" 클래스를 적용한다', () => {
    const { container } = render(<Spinner size="lg" />)
    expect(container.firstChild).toHaveClass('h-8')
  })

  it('text-violet-500 클래스를 가진다', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toHaveClass('text-violet-500')
  })
})
