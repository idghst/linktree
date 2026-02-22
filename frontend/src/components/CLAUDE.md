# CLAUDE.md - frontend/src/components

## 역할
재사용 가능한 React 컴포넌트 폴더. UI 기본 요소와 레이아웃 컴포넌트로 분리하여 관리한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| (없음) | 하위 폴더로만 구성 |

## 규칙
- 모든 컴포넌트는 named export 사용 (`export function Foo` 또는 `export const Foo`)
- 컴포넌트 파일명은 PascalCase
- 재사용 가능한 기본 UI는 `ui/`, 페이지 구조 관련은 `layout/`에 배치
- 클라이언트 상호작용 필요 시 파일 상단에 `"use client"` 선언

## 관련 폴더
- `ui/` — Button, Input, Modal 등 기본 UI 컴포넌트
- `layout/` — Header, DashboardSidebar 등 레이아웃 컴포넌트
- `../app/` — 컴포넌트를 조합하는 페이지
