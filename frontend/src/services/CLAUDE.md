# CLAUDE.md - frontend/src/services

## 역할
도메인별 API 호출 함수 모음 폴더. `apiRequest`를 래핑하여 타입이 지정된 API 인터페이스를 제공한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| auth.ts | authService - register, login, getMe, refresh API 래퍼 |
| links.ts | linksService - 링크 CRUD, reorder, toggle API 래퍼 |
| profile.ts | profileService - getMyProfile, updateProfile, getPublicProfile API 래퍼 |
| analytics.ts | analyticsService - getSummary, getLinkStats, getViewStats API 래퍼 |

## 규칙
- 각 서비스는 객체 리터럴(`export const xService = { ... }`) 패턴으로 export
- 모든 함수는 `apiRequest<ReturnType>` 호출로 타입 안전성 보장
- 인증 불필요한 엔드포인트는 `{ skipAuth: true }` 옵션 명시
- 서비스 함수는 Promise를 직접 반환 (async/await 불필요)

## 관련 폴더
- `../lib/api-client.ts` — apiRequest, ApiError
- `../types/api.ts` — 요청/응답 타입 정의
- `../hooks/` — 서비스 함수를 호출하는 커스텀 훅
