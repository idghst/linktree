# CLAUDE.md - frontend/src/app

## 역할
Next.js App Router 루트. 모든 페이지, 레이아웃, 전역 스타일을 포함하며 파일 시스템 기반 라우팅을 사용한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| layout.tsx | 루트 레이아웃 - 메타데이터, globals.css, html/body 태그 |
| page.tsx | 홈 페이지 (`/`) - 랜딩 또는 /dashboard 리다이렉트 |
| globals.css | 전역 CSS - Tailwind CSS 기본 스타일 |
| not-found.tsx | 404 페이지 |
| icon.tsx | 파비콘 동적 생성 - ImageResponse로 32x32 PNG 아이콘 반환 |

## 규칙
- 폴더명이 라우트 경로가 됨 (`[username]` → 동적 세그먼트)
- `layout.tsx`는 해당 폴더와 하위 폴더에 공통 적용
- 서버 컴포넌트 기본, 클라이언트 상호작용 필요 시 `"use client"` 추가
- 페이지 파일명은 항상 `page.tsx`

## 관련 폴더
- `[username]/` — 공개 프로필 페이지 (동적 라우트)
- `auth/` — 로그인/회원가입 페이지
- `dashboard/` — 인증된 사용자 대시보드
