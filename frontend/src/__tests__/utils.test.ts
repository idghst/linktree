// 파일 목적: lib/utils.ts 유틸리티 함수 단위 테스트
// 주요 기능: cn, formatDate, truncate, getInitials 검증
// 사용 방법: vitest run

import { describe, it, expect } from 'vitest'
import { cn, formatDate, truncate, getInitials } from '@/lib/utils'

describe('cn', () => {
  it('여러 클래스 문자열을 공백으로 합친다', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('falsy 값(null, undefined, false)을 필터링한다', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar')
  })

  it('모든 값이 falsy이면 빈 문자열을 반환한다', () => {
    expect(cn(null, undefined, false)).toBe('')
  })

  it('단일 클래스를 그대로 반환한다', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('인자 없이 호출 시 빈 문자열을 반환한다', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDate', () => {
  it('날짜 문자열을 한국어 형식으로 변환한다', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('2024')
    expect(result).toContain('1')
    expect(result).toContain('15')
  })

  it('문자열 타입을 반환한다', () => {
    expect(typeof formatDate('2023-06-01')).toBe('string')
  })

  it('연도 정보를 포함한다', () => {
    const result = formatDate('2024-12-25')
    expect(result).toContain('2024')
  })
})

describe('truncate', () => {
  it('maxLength 이하일 때 원본 문자열을 그대로 반환한다', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('maxLength 초과 시 잘라내고 "..."을 붙인다', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('정확히 maxLength인 경우 잘라내지 않는다', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('빈 문자열을 그대로 반환한다', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('maxLength가 0이면 "..."만 반환한다', () => {
    expect(truncate('hello', 0)).toBe('...')
  })
})

describe('getInitials', () => {
  it('null 입력 시 "?"를 반환한다', () => {
    expect(getInitials(null)).toBe('?')
  })

  it('빈 문자열 입력 시 "?"를 반환한다', () => {
    expect(getInitials('')).toBe('?')
  })

  it('단어가 하나인 이름에서 첫 글자(대문자)를 반환한다', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('두 단어 이름에서 각 첫 글자를 합쳐 반환한다', () => {
    expect(getInitials('Alice Bob')).toBe('AB')
  })

  it('세 단어 이상의 이름에서 최대 2글자만 반환한다', () => {
    expect(getInitials('Alice Bob Charlie')).toBe('AB')
  })

  it('소문자 이름을 대문자로 변환한다', () => {
    expect(getInitials('alice bob')).toBe('AB')
  })
})
