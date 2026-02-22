# CLAUDE.md - frontend/src/app/dashboard

## 역할
인증된 사용자 전용 대시보드 폴더. 통계 개요, 링크 관리 페이지와 공통 레이아웃(사이드바)을 포함한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| layout.tsx | 대시보드 레이아웃 - 인증 가드 + DashboardSidebar + 콘텐츠 영역 |
| page.tsx | 대시보드 홈 `/dashboard` - AnalyticsSummary 통계 카드 3개 |
| links/page.tsx | 링크 관리 `/dashboard/links` - 링크 CRUD, 드래그 순서 변경 |

## 규칙
- middleware.ts가 미인증 접근을 `/auth/login`으로 차단
- 모든 페이지는 클라이언트 컴포넌트(`"use client"`) - useAuth, useApi 훅 사용
- 통계 데이터는 `useApi<AnalyticsSummary>("/api/analytics/summary")` 패턴
- 링크 CRUD는 `linksService` 메서드 호출 후 `refetch()` 갱신

## 관련 폴더
- `../../hooks/` — useAuth, useApi 훅
- `../../components/layout/` — DashboardSidebar, Header
- `../../components/ui/` — Button, Modal, Input 등 UI 컴포넌트
