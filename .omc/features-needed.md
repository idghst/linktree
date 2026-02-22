# Linktree 누락 기능 목록

## 우선순위별 구현 대상

| # | 기능명 | 복잡도 | 상태 |
|---|--------|--------|------|
| 1 | 민감한 링크 경고 (is_sensitive) | 낮음 | ✅ 완료 |
| 2 | 링크 예약 공개 (scheduled_start/end) | 낮음 | ✅ 완료 |
| 3 | 링크 그룹/헤더 구분선 (link_type) | 낮음 | ✅ 완료 |
| 4 | 커스텀 SEO 설정 (seo_settings) | 낮음 | ✅ 완료 |
| 5 | 링크 아이콘 자동 추출 (favicon_url) | 중간 | ✅ 완료 |

## 기능 상세

### 1. 민감한 링크 경고
- DB: `links.is_sensitive` (Boolean, default=False)
- 백엔드: CreateLinkRequest/UpdateLinkRequest/LinkResponse에 필드 추가
- 프론트엔드: 대시보드 체크박스 + 공개 프로필 클릭 시 확인 모달

### 2. 링크 예약 공개
- DB: `links.scheduled_start`, `links.scheduled_end` (DateTime, nullable)
- 백엔드: public.py에서 현재 시간 기준 필터링
- 프론트엔드: 링크 편집 폼에 날짜 선택기 + 예약 상태 배지

### 3. 링크 그룹/헤더 구분선
- DB: `links.link_type` (String, default="link")
- 백엔드: link_type == "header"일 때 url optional
- 프론트엔드: 헤더 추가 버튼 + 공개 프로필에서 구분선 렌더링

### 4. 커스텀 SEO 설정
- DB: `users.seo_settings` (JSONB, nullable)
- 백엔드: UpdateProfileRequest/PublicProfileResponse에 필드 추가
- 프론트엔드: 프로필 설정 SEO 섹션 + generateMetadata 업데이트

### 5. 링크 아이콘 자동 추출
- DB: `links.favicon_url` (String, nullable)
- 백엔드: 링크 생성 시 BackgroundTasks로 favicon/OG 이미지 추출
- 프론트엔드: 링크 목록과 공개 프로필에서 아이콘 표시
