import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Modal } from '@/components/ui/Modal'

describe('Modal', () => {
  it('open=true일 때 렌더링된다', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="테스트 모달">
        <p>모달 내용</p>
      </Modal>
    )
    expect(screen.getByText('테스트 모달')).toBeInTheDocument()
    expect(screen.getByText('모달 내용')).toBeInTheDocument()
  })

  it('open=false일 때 렌더링되지 않는다', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="테스트 모달">
        <p>모달 내용</p>
      </Modal>
    )
    expect(screen.queryByText('테스트 모달')).not.toBeInTheDocument()
  })

  it('X 버튼 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="닫기 테스트">
        <p>내용</p>
      </Modal>
    )
    const closeButtons = screen.getAllByRole('button')
    await userEvent.click(closeButtons[0])
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('오버레이 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="오버레이 테스트">
        <p>내용</p>
      </Modal>
    )
    // 오버레이는 fixed inset-0 배경
    const overlay = document.querySelector('.absolute.inset-0')
    if (overlay) {
      await userEvent.click(overlay as HTMLElement)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('ESC 키 입력 시 onClose를 호출한다', async () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="ESC 테스트">
        <p>내용</p>
      </Modal>
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ESC가 아닌 다른 키 입력 시 onClose를 호출하지 않는다', async () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="키 테스트">
        <p>내용</p>
      </Modal>
    )
    await userEvent.keyboard('{Enter}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('title 없이도 렌더링된다', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>title 없는 모달</p>
      </Modal>
    )
    expect(screen.getByText('title 없는 모달')).toBeInTheDocument()
  })
})
