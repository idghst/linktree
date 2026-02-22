// 파일 목적: hooks/useApi.ts 커스텀 훅 테스트
// 주요 기능: 데이터 페칭, loading/error 상태, 재시도 로직, refetch 동작 검증
// 사용 방법: vitest run

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { useApi } from '@/hooks/useApi'

// 캐시 간섭 방지를 위해 모든 테스트에 skipCache: true 사용

describe('useApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('초기 상태는 loading=true, data=null, error=null이다', () => {
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true })
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('요청 성공 시 data를 설정하고 loading을 false로 전환한다', async () => {
    server.use(
      http.get('/api/links', () =>
        HttpResponse.json([{ id: '1', title: '테스트 링크' }])
      )
    )
    const { result } = renderHook(() =>
      useApi<Array<{ id: string; title: string }>>('/api/links', { skipCache: true })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: '1', title: '테스트 링크' }])
    expect(result.current.error).toBeNull()
  })

  it('요청 실패 시 error를 설정하고 loading을 false로 전환한다', async () => {
    server.use(
      http.get('/api/links', () =>
        HttpResponse.json({ detail: '서버 내부 오류' }, { status: 500 })
      )
    )
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('서버 내부 오류')
    expect(result.current.data).toBeNull()
  })

  it('4xx 에러는 retries 옵션이 있어도 재시도하지 않는다', async () => {
    let callCount = 0
    server.use(
      http.get('/api/links', () => {
        callCount++
        return HttpResponse.json({ detail: '잘못된 요청' }, { status: 400 })
      })
    )
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true, retries: 3 })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1) // 4xx는 즉시 중단
    expect(result.current.error).toBe('잘못된 요청')
  })

  it('5xx 에러는 retries 횟수만큼 재시도한다', async () => {
    let callCount = 0
    server.use(
      http.get('/api/links', () => {
        callCount++
        if (callCount < 3) {
          return HttpResponse.json({ detail: '서버 오류' }, { status: 500 })
        }
        return HttpResponse.json([{ id: '1' }])
      })
    )
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true, retries: 2, retryDelay: 10 })
    )
    await waitFor(
      () => expect(result.current.loading).toBe(false),
      { timeout: 3000 }
    )
    expect(callCount).toBe(3)
    expect(result.current.data).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('refetch 호출 시 최신 데이터를 다시 가져온다', async () => {
    let callCount = 0
    server.use(
      http.get('/api/links', () => {
        callCount++
        return HttpResponse.json([{ id: String(callCount) }])
      })
    )
    const { result } = renderHook(() =>
      useApi<Array<{ id: string }>>('/api/links', { skipCache: true })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.[0].id).toBe('1')

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.[0].id).toBe('2')
    expect(callCount).toBe(2)
  })

  it('refetch 호출 시 이전 error를 초기화한다', async () => {
    let callCount = 0
    server.use(
      http.get('/api/links', () => {
        callCount++
        if (callCount === 1) {
          return HttpResponse.json({ detail: '임시 오류' }, { status: 500 })
        }
        return HttpResponse.json([])
      })
    )
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('임시 오류')

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual([])
  })

  it('skipCache=false(기본값)일 때 결과를 캐시에 저장하고 반환한다', async () => {
    server.use(
      http.get('/api/cached-endpoint', () =>
        HttpResponse.json([{ id: '1' }])
      )
    )
    const { result } = renderHook(() =>
      useApi<Array<{ id: string }>>('/api/cached-endpoint')
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: '1' }])
    expect(result.current.error).toBeNull()
  })

  it('ApiError가 아닌 일반 오류 발생 시 기본 에러 메시지를 설정한다', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network error'))
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('알 수 없는 오류가 발생했습니다.')
  })

  it('캐시에 데이터가 있을 때 loading을 false로 초기화한다', async () => {
    server.use(
      http.get('/api/cache-hit-branch', () =>
        HttpResponse.json([{ id: '1' }])
      )
    )
    // 첫 번째 렌더: 캐시 미스 → 데이터를 캐시에 저장
    const { result: r1, unmount: unmount1 } = renderHook(() =>
      useApi<Array<{ id: string }>>('/api/cache-hit-branch')
    )
    await waitFor(() => expect(r1.current.loading).toBe(false))
    unmount1()

    // 두 번째 렌더: 캐시 히트 → loading이 false로 시작, setLoading(true) 미호출
    const { result: r2 } = renderHook(() =>
      useApi<Array<{ id: string }>>('/api/cache-hit-branch')
    )
    expect(r2.current.loading).toBe(false)
    expect(r2.current.data).toEqual([{ id: '1' }])
  })

  it('AbortError 발생 시 에러 상태를 설정하지 않는다', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(abortError)
    const { result } = renderHook(() =>
      useApi('/api/links', { skipCache: true })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })
})
