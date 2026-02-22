# CLAUDE.md - frontend/src/lib

## 역할
공통 유틸리티, API 클라이언트, 상수 정의 폴더. 애플리케이션 전반에서 사용하는 헬퍼 함수와 설정값을 제공한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| api-client.ts | fetch 래퍼 - Authorization 헤더 자동 주입, ApiError 클래스, 204 처리 |
| constants.ts | 전역 상수 - API_BASE_URL, STORAGE_KEYS(토큰 키), ROUTES(라우트 경로) |
| utils.ts | 유틸리티 함수 - cn(클래스 병합), formatDate(날짜 포맷), truncate(문자열 자르기), getInitials(이니셜 추출) |

## 규칙
- `apiRequest<T>`: 제네릭 반환 타입, `skipAuth: true` 옵션으로 인증 헤더 생략 가능
- `ApiError`: `status`(HTTP 상태코드)와 `detail`(에러 메시지) 프로퍼티 제공
- `STORAGE_KEYS`는 `as const`로 타입 고정
- `API_BASE_URL`은 `NEXT_PUBLIC_API_URL` 환경변수 우선, fallback은 `localhost:8000`

## 관련 폴더
- `../hooks/` — api-client를 사용하는 커스텀 훅
- `../services/` — api-client 기반 도메인 서비스 함수
- `../components/ui/` — utils의 cn() 사용
