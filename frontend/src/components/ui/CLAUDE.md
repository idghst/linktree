# CLAUDE.md - frontend/src/components/ui

## 역할
기본 UI 컴포넌트 폴더. 디자인 시스템의 원자적 요소들을 정의하며 프로젝트 전반에서 재사용된다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| Button.tsx | 버튼 - variant(primary/secondary/danger/ghost), size(sm/md/lg), loading 스피너 |
| Input.tsx | 입력 필드 - label, error 메시지, forwardRef 지원 |
| Modal.tsx | 모달 다이얼로그 - isOpen/onClose, 오버레이 클릭 닫기 |
| LinkCard.tsx | 링크 카드 - 제목/URL/활성상태 표시, 편집/삭제 액션 |
| Avatar.tsx | 아바타 - 이미지 또는 이니셜 폴백 표시 |
| Spinner.tsx | 로딩 스피너 - size(sm/md/lg) 지원 |

## 규칙
- 모든 컴포넌트는 `"use client"` 선언
- `cn()` 유틸리티(`@/lib/utils`)로 클래스 병합
- `forwardRef` 사용으로 ref 전달 지원 (Button, Input)
- Tailwind CSS만 사용, 인라인 스타일 금지
- 기본값(variant, size)은 컴포넌트 내부에서 정의

## 관련 폴더
- `../layout/` — 레이아웃 컴포넌트
- `../../lib/utils.ts` — cn() 유틸리티
