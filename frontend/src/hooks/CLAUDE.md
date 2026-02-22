# CLAUDE.md - frontend/src/hooks

## 역할
커스텀 React 훅 폴더. 공통 상태 관리 로직을 재사용 가능한 훅으로 추상화한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| useAuth.ts | AuthContext에서 useAuth를 re-export하는 얇은 래퍼 (실제 로직은 contexts/AuthContext.tsx에 위치) |
| useApi.ts | API 요청 상태 - data/loading/error/refetch 반환, 마운트 시 자동 fetch, 메모리 캐시로 깜빡임 방지 |

## 규칙
- `useApi.ts`: 파일 상단에 `"use client"` 선언 필수 (useState/useEffect 사용)
- `useAuth.ts`: re-export만 하므로 `"use client"` 불필요
- `useApi<T>`: 제네릭 타입으로 응답 타입 명시
- `useCallback`으로 함수 메모이제이션, `useEffect`로 마운트 시 실행
- 에러는 `ApiError` 인스턴스 확인 후 `err.detail` 사용

## 관련 폴더
- `../contexts/` — AuthContext (useAuth 실제 구현체)
- `../lib/api-client.ts` — apiRequest 함수, ApiError 클래스
- `../lib/constants.ts` — STORAGE_KEYS, ROUTES 상수
- `../types/api.ts` — User, TokenResponse 등 타입
