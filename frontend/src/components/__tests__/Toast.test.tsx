import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Toast, showToast } from '@/components/ui/Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('showToast 호출 시 메시지가 표시된다', async () => {
    render(<Toast />)
    act(() => {
      showToast('저장되었습니다', 'success')
    })
    expect(screen.getByText('저장되었습니다')).toBeInTheDocument()
  })

  it('success 타입에 green 배경 클래스를 적용한다', () => {
    render(<Toast />)
    act(() => {
      showToast('성공 메시지', 'success')
    })
    const toastEl = screen.getByText('성공 메시지').closest('div')
    expect(toastEl).toHaveClass('bg-violet-500')
  })

  it('error 타입에 red 배경 클래스를 적용한다', () => {
    render(<Toast />)
    act(() => {
      showToast('오류 메시지', 'error')
    })
    const toastEl = screen.getByText('오류 메시지').closest('div')
    expect(toastEl).toHaveClass('bg-red-500')
  })

  it('info 타입에 gray 배경 클래스를 적용한다', () => {
    render(<Toast />)
    act(() => {
      showToast('정보 메시지', 'info')
    })
    const toastEl = screen.getByText('정보 메시지').closest('div')
    expect(toastEl).toHaveClass('bg-gray-800')
  })

  it('3초 후 토스트가 사라진다', async () => {
    render(<Toast />)
    act(() => {
      showToast('사라질 메시지', 'success')
    })
    expect(screen.getByText('사라질 메시지')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('사라질 메시지')).not.toBeInTheDocument()
  })

  it('토스트가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<Toast />)
    expect(container.firstChild).toBeNull()
  })
})
