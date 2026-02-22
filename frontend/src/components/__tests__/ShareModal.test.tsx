import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShareModal } from '@/components/ui/ShareModal'
import * as ToastModule from '@/components/ui/Toast'

describe('ShareModal', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('isOpen=true일 때 렌더링된다', () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('프로필 공유')).toBeInTheDocument()
  })

  it('isOpen=false일 때 렌더링되지 않는다', () => {
    render(<ShareModal username="testuser" isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('프로필 공유')).not.toBeInTheDocument()
  })

  it('사용자명이 포함된 프로필 URL을 표시한다', () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText(/testuser/)).toBeInTheDocument()
  })

  it('복사 버튼이 렌더링된다', () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('복사')).toBeInTheDocument()
  })

  it('복사 버튼 클릭 시 clipboard.writeText를 호출한다', async () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText('복사'))
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('복사 후 "복사됨 ✓" 텍스트를 표시한다', async () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText('복사'))
    expect(await screen.findByText('복사됨 ✓')).toBeInTheDocument()
  })

  it('Twitter 공유 링크를 렌더링한다', () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    const twitterLink = screen.getByText('Twitter').closest('a')
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining('twitter.com'))
  })

  it('카카오스토리 공유 링크를 렌더링한다', () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    const kakaoLink = screen.getByText('카카오스토리').closest('a')
    expect(kakaoLink).toHaveAttribute('href', expect.stringContaining('kakao.com'))
  })

  it('QR 코드 이미지를 렌더링한다', () => {
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    const qrImg = screen.getByAltText('testuser 프로필 QR 코드')
    expect(qrImg).toBeInTheDocument()
  })

  it('clipboard 복사 실패 시 에러 토스트를 표시한다', async () => {
    const showToastSpy = vi.spyOn(ToastModule, 'showToast')
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('clipboard denied')),
      },
    })
    render(<ShareModal username="testuser" isOpen={true} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText('복사'))
    await waitFor(() => {
      expect(showToastSpy).toHaveBeenCalledWith('복사에 실패했습니다.', 'error')
    })
  })
})
