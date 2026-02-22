# CLAUDE.md - frontend/src

## 역할
Next.js 프론트엔드 소스 루트. 애플리케이션의 모든 TypeScript/React 소스 코드를 포함하며 `@/` 경로 alias의 기준점이다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| middleware.ts | URL 재작성 미들웨어 - /@username → /username 경로 rewrite로 공개 프로필 접근 |

## 규칙
- `@/` alias는 이 디렉토리(`src/`)를 가리킴
- 모든 파일 최상단에 3줄 주석 필수 (목적/기능/사용법)
- 클라이언트 컴포넌트는 `"use client"` 선언 필수
- 서버 컴포넌트는 기본값 (async 함수, 데이터 fetch 가능)

## 관련 폴더
- `app/` — Next.js App Router 페이지 및 레이아웃
- `components/` — 재사용 가능한 React 컴포넌트
- `hooks/` — 커스텀 React 훅
- `contexts/` — React Context (전역 상태 관리)
- `lib/` — 유틸리티 함수 및 상수
- `services/` — API 호출 함수
- `types/` — TypeScript 타입 정의
