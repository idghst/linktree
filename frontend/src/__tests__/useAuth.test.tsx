// 파일 목적: contexts/AuthContext (useAuth hook) 테스트
// 주요 기능: login, logout, register, fetchMe, updateUser 동작 및 인증 상태 변화 검증
// 사용 방법: vitest run

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { STORAGE_KEYS } from '@/lib/constants'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
  })

  it('AuthProvider 외부에서 호출 시 에러를 throw한다', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider'
    )
    consoleSpy.mockRestore()
  })

  it('토큰 없을 때 user가 null이고 loading이 false로 전환된다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('localStorage에 토큰이 있으면 마운트 시 /api/auth/me를 호출해 user를 설정한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.username).toBe('testuser')
  })

  it('login 성공 시 토큰을 저장하고 user를 설정한 뒤 /dashboard로 이동한다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' })
    })

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('mock-access-token')
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('mock-refresh-token')
    expect(result.current.user).not.toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('login 실패 시 ApiError를 throw한다', async () => {
    server.use(
      http.post('/graphql', () =>
        HttpResponse.json({ errors: [{ message: '이메일 또는 비밀번호가 틀렸습니다.' }] })
      )
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let caughtError: unknown = null
    await act(async () => {
      try {
        await result.current.login({ email: 'wrong@example.com', password: 'wrong' })
      } catch (err) {
        caughtError = err
      }
    })
    expect(caughtError).toBeDefined()
    expect(result.current.user).toBeNull()
    expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
  })

  it('logout 시 토큰을 제거하고 user를 null로 만들며 /auth/login으로 이동한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'valid-refresh')
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    expect(result.current.user).toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('register 성공 시 회원가입 후 자동 로그인하고 /dashboard로 이동한다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })
    })

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('mock-access-token')
    expect(result.current.user).not.toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('updateUser 호출 시 user 상태를 즉시 업데이트한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    const updated = { ...result.current.user!, display_name: '새 이름' }
    act(() => {
      result.current.updateUser(updated)
    })

    expect(result.current.user?.display_name).toBe('새 이름')
  })

  it('auth:logout 커스텀 이벤트 수신 시 user를 null로 만들고 /auth/login으로 이동한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).not.toBeNull()

    act(() => {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    })

    expect(result.current.user).toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('유효하지 않은 토큰으로 fetchMe 실패 시 user가 null을 유지한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'invalid-token')
    server.use(
      http.post('/graphql', () =>
        HttpResponse.json({ errors: [{ message: '유효하지 않은 토큰' }] })
      )
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })
})
