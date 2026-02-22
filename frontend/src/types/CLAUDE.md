# CLAUDE.md - frontend/src/types

## 역할
TypeScript 타입 정의 폴더. 백엔드 API 응답/요청 구조에 대응하는 인터페이스를 정의하여 타입 안전성을 보장한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| api.ts | User, Link, TokenResponse, PublicProfile, AnalyticsSummary 등 모든 API 타입 |

## 규칙
- `import type`으로 타입만 import (런타임 오버헤드 없음)
- 백엔드 Pydantic 스키마와 필드명/타입 일치 유지 (snake_case 그대로 사용)
- nullable 필드는 `string | null` 형태로 표현
- 요청 타입(`Request`)과 응답 타입(`Response`)을 명확히 구분
- `as const`나 enum 대신 interface/type alias 사용

## 관련 폴더
- `../services/` — 타입을 반환 타입/인자 타입으로 사용
- `../hooks/` — useAuth, useApi에서 타입 참조
- `../../backend/app/schemas/` — 대응하는 백엔드 Pydantic 스키마
