// 파일 목적: SEO 설정 기능 테스트 - 프로필 설정 페이지의 SEO 섹션 렌더링 확인
// 주요 기능: seo_title, seo_description, seo_og_image 필드 렌더링 확인
// 사용 방법: vitest run

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { User } from '@/types/api'

const mockUser: User = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  display_name: '테스트',
  bio: null,
  avatar_url: null,
  theme: 'light',
  bg_color: '#f0fdf4',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  seo_settings: {
    title: '기존 SEO 제목',
    description: '기존 SEO 설명',
    og_image: 'https://example.com/og.jpg',
  },
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, updateUser: vi.fn() }),
}))

vi.mock('@/services/profile', () => ({
  profileService: {
    updateProfile: vi.fn(),
  },
}))

vi.mock('@/services/auth', () => ({
  authService: {
    changePassword: vi.fn(),
  },
}))

import ProfileSettingsPage from '@/app/dashboard/profile/page'

describe('SeoSettings - SEO 설정 섹션', () => {
  it('SEO 설정 섹션 제목이 렌더링된다', () => {
    render(<ProfileSettingsPage />)
    expect(screen.getByText('SEO 설정')).toBeInTheDocument()
  })

  it('SEO 제목 입력 필드가 렌더링된다', () => {
    render(<ProfileSettingsPage />)
    expect(screen.getByLabelText('SEO 제목')).toBeInTheDocument()
  })

  it('SEO 설명 textarea가 렌더링된다', () => {
    render(<ProfileSettingsPage />)
    expect(screen.getByPlaceholderText('검색 결과에 표시될 설명')).toBeInTheDocument()
  })

  it('OG 이미지 URL 입력 필드가 렌더링된다', () => {
    render(<ProfileSettingsPage />)
    expect(screen.getByLabelText('OG 이미지 URL')).toBeInTheDocument()
  })

  it('기존 seo_settings 값이 필드에 채워진다', () => {
    render(<ProfileSettingsPage />)
    expect(screen.getByLabelText('SEO 제목')).toHaveValue('기존 SEO 제목')
    expect(screen.getByPlaceholderText('검색 결과에 표시될 설명')).toHaveValue('기존 SEO 설명')
    expect(screen.getByLabelText('OG 이미지 URL')).toHaveValue('https://example.com/og.jpg')
  })
})
