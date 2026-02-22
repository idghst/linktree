# CLAUDE.md - frontend

## 역할
Next.js 15 기반 프론트엔드 애플리케이션. App Router, TypeScript, Tailwind CSS를 사용하며 백엔드 FastAPI와 REST API로 통신한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| Dockerfile | Node 22-alpine 기반 이미지 빌드 (standalone 출력) |
| package.json | 의존성 - Next.js 15, React 19, Tailwind CSS 4, lucide-react |
| tsconfig.json | TypeScript 설정 - `@/*` 경로 alias (`./src/*`) |
| next.config.ts | Next.js 설정 - standalone 출력, rewrites (API 프록시) |
| postcss.config.mjs | PostCSS 설정 (Tailwind CSS 플러그인) |
| prettier.config.mjs | Prettier 코드 포맷 설정 |
| eslint.config.mjs | ESLint 규칙 설정 |

## 규칙
- 패키지 매니저는 **pnpm** 사용 (npm/yarn 금지)
- 컴포넌트 파일명은 PascalCase, 훅/서비스는 camelCase
- 클라이언트 컴포넌트는 파일 상단에 `"use client"` 선언
- API URL은 `NEXT_PUBLIC_API_URL` 환경변수로 관리
- `@/` 경로 alias 사용 (상대경로 금지)

## 관련 폴더
- `src/` — 애플리케이션 소스 코드
- `public/` — 정적 파일 (favicon, 이미지 등)
