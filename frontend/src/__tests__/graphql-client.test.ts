// 파일 목적: GraphQL 클라이언트 단위 테스트
// 주요 기능: GqlError 클래스, ApiError 별칭 검증
// 사용 방법: pnpm test --run

import { describe, it, expect } from 'vitest'
import { GqlError, ApiError } from '@/lib/graphql-client'

describe('GqlError', () => {
  it('status와 detail 속성을 가져야 한다', () => {
    const error = new GqlError(400, '잘못된 요청')
    expect(error.status).toBe(400)
    expect(error.detail).toBe('잘못된 요청')
    expect(error.name).toBe('GqlError')
    expect(error.message).toBe('잘못된 요청')
  })

  it('Error를 상속해야 한다', () => {
    const error = new GqlError(500, '서버 에러')
    expect(error).toBeInstanceOf(Error)
  })

  it('ApiError는 GqlError의 별칭이다', () => {
    const error = new ApiError(401, '인증 실패')
    expect(error).toBeInstanceOf(GqlError)
    expect(error.status).toBe(401)
    expect(error.detail).toBe('인증 실패')
  })

  it('status 0으로 네트워크 에러를 표현할 수 있다', () => {
    const error = new GqlError(0, '네트워크 오류')
    expect(error.status).toBe(0)
  })
})
