// 파일 목적: UI 컴포넌트 브랜치 커버리지 보완 테스트
// 주요 기능: LinkCard getDomain catch, Modal open=false, SocialIconPicker 빈 문자열
// 사용 방법: vitest run

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LinkCard } from '@/components/ui/LinkCard'
import { Modal } from '@/components/ui/Modal'
import { SocialIconPicker } from '@/components/ui/SocialIconPicker'
import type { Link, SocialLinks } from '@/types/api'

const mockLink: Link = {
  id: '1',
  user_id: 'user1',
  title: '테스트 링크',
  url: 'https://example.com',
  position: 0,
  is_active: true,
  click_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('LinkCard', () => {
  it('유효하지 않은 URL은 원본 문자열을 도메인으로 표시한다 (getDomain catch 분기)', () => {
    const invalidLink = { ...mockLink, url: 'not-a-valid-url' }
    render(<LinkCard link={invalidLink} />)
    expect(screen.getByText('not-a-valid-url')).toBeInTheDocument()
  })
})

describe('Modal', () => {
  it('open=false일 때 null을 렌더링한다 (if(open) false 분기)', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        <span>내용</span>
      </Modal>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('open=true일 때 children을 렌더링한다', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="테스트 모달">
        <span>모달 내용</span>
      </Modal>
    )
    expect(screen.getByText('모달 내용')).toBeInTheDocument()
    expect(screen.getByText('테스트 모달')).toBeInTheDocument()
  })

  it('Escape 외 키 입력 시 onClose를 호출하지 않는다 (if(e.key=Escape) false 분기)', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <span>내용</span>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('SocialIconPicker', () => {
  it('빈 문자열 입력 시 onChange에 undefined를 전달한다 (url || undefined 분기)', () => {
    const handleChange = vi.fn()
    const value: SocialLinks = { github: 'https://github.com/user' }
    render(<SocialIconPicker value={value} onChange={handleChange} />)
    const input = screen.getByPlaceholderText('https://github.com/username')
    fireEvent.change(input, { target: { value: '' } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ github: undefined })
    )
  })
})
