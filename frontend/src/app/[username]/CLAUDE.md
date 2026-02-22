# CLAUDE.md - frontend/src/app/[username]

## 역할
동적 라우트 폴더. `/{username}` 경로에서 사용자의 공개 프로필 페이지를 서버 사이드 렌더링으로 제공한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| page.tsx | 공개 프로필 서버 컴포넌트 - 아바타, 링크 목록, generateMetadata |

## 규칙
- 서버 컴포넌트(async function)로 구현 - SEO 최적화
- `generateMetadata`로 동적 OG 태그 생성
- `fetch(..., { next: { revalidate: 60 } })`로 1분 캐싱
- 프로필 없으면 `notFound()` 호출 → 404 처리
- 링크 클릭은 `/api/public/links/{id}/click` (302 리다이렉트)로 추적

## 관련 폴더
- `../` — 루트 app 폴더
- `../../services/` — API 호출 함수
- `../../types/api.ts` — PublicProfile 타입
