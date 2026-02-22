# CLAUDE.md - frontend/src/components/layout

## 역할
레이아웃 컴포넌트 폴더. 페이지 구조를 구성하는 헤더, 사이드바 등 틀(frame) 역할의 컴포넌트를 담는다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| Header.tsx | 상단 헤더 - 로고, 사용자 정보, 로그아웃 버튼 |
| DashboardSidebar.tsx | 대시보드 사이드바 - 개요/링크관리 네비게이션, 현재 경로 활성화 |

## 규칙
- 모든 컴포넌트는 `"use client"` 선언 (usePathname, useAuth 훅 사용)
- 네비게이션 링크는 `ROUTES` 상수에서 가져옴
- 현재 활성 경로는 `usePathname()`으로 감지, `cn()`으로 조건부 스타일 적용
- lucide-react 아이콘 사용

## 관련 폴더
- `../ui/` — 레이아웃 내에서 사용하는 UI 컴포넌트
- `../../hooks/useAuth.ts` — 사용자 정보 및 logout 액션
- `../../lib/constants.ts` — ROUTES 상수
