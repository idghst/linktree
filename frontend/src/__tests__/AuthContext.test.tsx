import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { STORAGE_KEYS } from '@/lib/constants'

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

function TestComponent() {
  const { user, loading, login, logout } = useAuth()
  if (loading) return <div>로딩중</div>
  if (!user) return (
    <div>
      <span>로그인 안됨</span>
      <button onClick={() => login({ email: 'test@example.com', password: 'pass' })}>
        로그인
      </button>
    </div>
  )
  return (
    <div>
      <span>{user.username}</span>
      <button onClick={logout}>로그아웃</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  })

  it('토큰 없으면 loading 후 user=null 상태가 된다', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('로그인 안됨')).toBeInTheDocument()
    })
  })

  it('토큰 있으면 GraphQL me 쿼리를 호출하여 user를 설정한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('login 후 토큰을 localStorage에 저장한다', async () => {
    server.use(
      http.post('/graphql', async ({ request }) => {
        const body = await request.json() as { query: string }
        if (body.query.includes('mutation Login')) {
          return HttpResponse.json({ data: { login: { accessToken: 'new-token', refreshToken: 'new-refresh', tokenType: 'bearer' } } })
        }
        if (body.query.includes('query Me') || (body.query.includes('me') && body.query.includes('{'))) {
          return HttpResponse.json({ data: { me: { id: '00000000-0000-0000-0000-000000000001', username: 'testuser', email: 'test@example.com', displayName: 'Test User', bio: null, avatarUrl: null, theme: 'default', bgColor: '#ffffff', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } } })
        }
        return HttpResponse.json({ data: null })
      })
    )
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => screen.getByText('로그인 안됨'))
    await userEvent.click(screen.getByText('로그인'))
    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('new-token')
    })
  })

  it('logout 호출 시 localStorage 토큰이 제거된다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => screen.getByText('testuser'))
    await userEvent.click(screen.getByText('로그아웃'))
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
  })

  it('auth:logout 이벤트 수신 시 user를 null로 설정한다', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'valid-token')
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    await waitFor(() => screen.getByText('testuser'))
    act(() => {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    })
    await waitFor(() => {
      expect(screen.getByText('로그인 안됨')).toBeInTheDocument()
    })
  })
})
