import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Avatar } from '@/components/ui/Avatar'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('Avatar', () => {
  it('src가 없을 때 이니셜 컨테이너를 렌더링한다', () => {
    const { container } = render(<Avatar name="홍길동" />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.rounded-full')).toBeInTheDocument()
  })

  it('src가 있을 때 이미지를 렌더링한다', () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="홍길동" />)
    expect(screen.getByAltText('홍길동')).toBeInTheDocument()
  })

  it('src와 name 모두 없을 때도 렌더링된다', () => {
    const { container } = render(<Avatar />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('size="lg" 클래스를 적용한다', () => {
    const { container } = render(<Avatar name="홍길동" size="lg" />)
    expect(container.firstChild).toHaveClass('h-16')
  })

  it('size="sm" 클래스를 적용한다', () => {
    const { container } = render(<Avatar name="홍길동" size="sm" />)
    expect(container.firstChild).toHaveClass('h-8')
  })

  it('size="xl" 클래스를 적용한다', () => {
    const { container } = render(<Avatar name="홍길동" size="xl" />)
    expect(container.firstChild).toHaveClass('h-24')
  })

  it('이니셜 컨테이너에 violet-500 배경 클래스를 적용한다', () => {
    const { container } = render(<Avatar name="홍길동" />)
    expect(container.firstChild).toHaveClass('bg-violet-500')
  })

  it('src가 있고 name이 없을 때 "avatar"를 alt로 사용한다', () => {
    render(<Avatar src="https://example.com/avatar.jpg" />)
    expect(screen.getByAltText('avatar')).toBeInTheDocument()
  })
})
