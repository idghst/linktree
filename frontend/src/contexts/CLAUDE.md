# CLAUDE.md - frontend/src/contexts

## 역할
React Context 기반 전역 상태 관리 폴더. 여러 컴포넌트에서 공유해야 하는 상태를 Provider 패턴으로 제공한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| AuthContext.tsx | 전역 인증 상태 Context - /api/auth/me를 앱 전체에서 단 1회 호출, AuthProvider와 useAuth 훅 제공 |

## 규칙
- 모든 Context 파일 상단에 `"use client"` 선언 (useState/useEffect 사용)
- `AuthProvider`는 루트 레이아웃(`app/layout.tsx`)에 마운트
- `useAuth()`는 반드시 `AuthProvider` 하위에서만 호출 (외부 호출 시 에러 throw)
- 토큰은 `localStorage`에 보관 (`STORAGE_KEYS` 상수 사용)
- `hooks/useAuth.ts`가 이 파일에서 `useAuth`를 re-export하므로, 외부에서는 `@/hooks/useAuth`로 임포트

## 관련 폴더
- `../hooks/` — useAuth.ts (AuthContext의 useAuth를 re-export)
- `../lib/api-client.ts` — apiRequest 함수
- `../lib/constants.ts` — STORAGE_KEYS, ROUTES 상수
- `../types/api.ts` — User, LoginRequest, RegisterRequest, TokenResponse 타입
