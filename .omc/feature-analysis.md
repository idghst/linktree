# 기능 분석 결과

> 분석 일시: 2026-02-22
> 분석 대상: linktree 프로젝트 (FastAPI + Next.js 15)

---

## 현재 구현된 기능

### 백엔드 API 엔드포인트 전체 목록

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/health` | X | 서버 상태 확인 |
| POST | `/api/auth/register` | X | 회원가입 (201) |
| POST | `/api/auth/login` | X | 로그인 (JWT 발급) |
| POST | `/api/auth/refresh` | X | Access Token 갱신 |
| GET | `/api/auth/me` | O | 내 정보 조회 |
| PUT | `/api/auth/password` | O | 비밀번호 변경 (204) |
| GET | `/api/links` | O | 내 링크 목록 조회 |
| POST | `/api/links` | O | 링크 생성 (201) |
| PUT | `/api/links/{id}` | O | 링크 수정 |
| DELETE | `/api/links/{id}` | O | 링크 삭제 (204) |
| PUT | `/api/links/reorder` | O | 링크 순서 변경 |
| PATCH | `/api/links/{id}/toggle` | O | 링크 활성/비활성 토글 |
| GET | `/api/profile` | O | 내 프로필 조회 |
| PUT | `/api/profile` | O | 프로필 수정 |
| GET | `/api/public/{username}` | X | 공개 프로필 조회 |
| POST | `/api/public/{username}/view` | X | 프로필 방문 기록 |
| GET | `/api/public/links/{id}/click` | X | 링크 클릭 추적 (302 리다이렉트) |
| GET | `/api/analytics/summary` | O | 통계 요약 (총 클릭/방문/CTR) |
| GET | `/api/analytics/links` | O | 링크별 클릭 통계 |
| GET | `/api/analytics/views?days=N` | O | 기간별 방문 통계 (일별) |
| GET | `/api/analytics/top-links?limit=N` | O | 상위 클릭 링크 |
| GET | `/api/analytics/recent-clicks?limit=N` | O | 최근 클릭 내역 |

### 백엔드 DB 모델

| 모델 | 테이블 | PK | 주요 필드 |
|------|--------|-----|-----------|
| User | `users` | UUID | username(unique), email(unique), password_hash, display_name, bio, avatar_url, social_links(JSONB), theme, bg_color, is_active |
| Link | `links` | UUID | user_id(FK), title, url, description, thumbnail_url, position, is_active, click_count |
| ProfileView | `profile_views` | BigSerial | user_id(FK), viewer_ip(INET), user_agent, viewed_at |
| LinkClick | `link_clicks` | BigSerial | link_id(FK), user_id(FK), visitor_ip(INET), user_agent, clicked_at |

### 백엔드 비즈니스 로직
- **인증**: bcrypt 해싱, JWT(HS256) access/refresh 토큰, 비밀번호 변경
- **링크 CRUD**: 최대 50개/사용자 제한, position 기반 정렬, 소유권 검증
- **프로필**: 허용 필드 화이트리스트 방식 업데이트, 공개 프로필(활성 링크만)
- **분석**: 방문 중복 방지(IP 기준 1시간), IP 마스킹, 일별 집계, CTR 계산
- **예외 처리**: AppException 계층 (404/400/401/403/409), ValidationError 핸들러

### 프론트엔드 페이지 구조

| 경로 | 타입 | 설명 |
|------|------|------|
| `/` | Server | 랜딩 페이지 (CTA 버튼) |
| `/auth/login` | Client | 로그인 폼 |
| `/auth/register` | Client | 회원가입 폼 (비밀번호 확인) |
| `/dashboard` | Client | 통계 대시보드 (카드 4개, 바 차트, 링크 순위) |
| `/dashboard/links` | Client | 링크 관리 (CRUD, 드래그앤드롭 정렬) |
| `/dashboard/profile` | Client | 프로필 설정 (기본정보, 테마, 소셜 링크) |
| `/{username}` | Server | 공개 프로필 (SSR, 60초 캐시, SEO 메타) |
| `/@{username}` | Rewrite | → `/{username}` 미들웨어 리라이트 |

### 프론트엔드 주요 기능
- **인증 시스템**: AuthContext 전역 상태, localStorage 토큰 관리, 401 자동 refresh, auth:logout 이벤트
- **API 클라이언트**: 자동 Bearer 헤더, 401 refresh 재시도, ApiError 클래스
- **useApi 훅**: 메모리 캐시, 자동 fetch, 재시도, AbortController 취소
- **링크 관리**: HTML5 DnD 정렬, 낙관적 업데이트(토글), Modal 기반 CRUD
- **프로필 설정**: 아바타 URL 미리보기, 프리셋 배경색 + 컬러피커, 테마 선택, 소셜 링크 7종
- **공개 프로필**: SSR + generateMetadata(OG), 클릭 추적, 소셜 아이콘(SVG), 공유 버튼
- **UI 컴포넌트**: Button, Input, Modal, Avatar, Spinner, Toast, LinkCard, ThemeSelector, SocialIconPicker, ShareModal, DashboardSidebar, Header

---

## 누락된/불완전한 기능

### 백엔드

#### 1. 계정 관리 기능 누락
- **이메일 인증**: 회원가입 시 이메일 확인 절차 없음 — 아무 이메일로나 가입 가능
- **비밀번호 찾기/재설정**: 비밀번호 분실 시 복구 API 없음 (`POST /auth/forgot-password`, `POST /auth/reset-password`)
- **계정 삭제(탈퇴)**: 사용자 계정 삭제 API 없음 — GDPR/개인정보 보호법 이슈
- **로그아웃(서버측)**: 서버측 토큰 무효화 메커니즘 없음 — refresh token blacklist 미구현

#### 2. 보안 취약점
- **Rate Limiting 없음**: 로그인/회원가입에 brute-force 방어 없음 — slowapi 등 필요
- **비밀번호 강도 검증 미흡**: 최소 8자만 체크 — 대소문자/특수문자/숫자 혼합 미검증
- **JWT Secret Key 기본값 하드코딩**: `config.py:21` — `"your-super-secret-key-change-in-production-minimum-32-chars"` 기본값이 코드에 노출
- **CORS `allow_methods=["*"]`**: 운영 환경에서 허용 메서드 제한 필요
- **IP 주소 직접 저장**: analytics 모델에서 INET 타입으로 원본 IP 저장 — 해싱 또는 익명화 미적용
- **XSS 방어**: `social_links`가 JSONB로 임의 URL 저장 가능 — `javascript:` 프로토콜 검증 없음
- **URL 검증 부족**: `CreateLinkRequest`에서 `http://`/`https://` prefix만 체크 — SSRF 방어(내부 IP 차단) 없음
- **SQL Injection**: ORM 사용으로 기본 방어되지만, `noqa: E712` 주석으로 `== True` 비교를 사용 중 (SQLAlchemy `.is_(True)` 패턴이 더 안전)

#### 3. 데이터 관리 누락
- **Soft Delete 미구현**: 링크 삭제가 즉시 물리 삭제 — 복구 불가능
- **데이터 Export/Import**: 사용자 데이터 내보내기/가져오기 API 없음
- **프로필 이미지 업로드**: `avatar_url`만 지원 — 실제 파일 업로드 미구현
- **링크 썸네일 자동 생성**: `thumbnail_url` 필드 존재하지만 OG 이미지 자동 fetch 없음

#### 4. API 설계 이슈
- **Pagination 없음**: 링크 목록, 분석 데이터 등에 페이지네이션 미구현 — 대량 데이터 시 성능 문제
- **검색/필터링 없음**: 링크 검색, 분석 데이터 필터링 API 없음
- **Bulk 작업 없음**: 링크 일괄 삭제/활성화 등 미지원
- **API 버전닝 없음**: `/api/v1/` 패턴 미사용
- **`public.py` 라우터의 비즈니스 로직**: `record_view`, `record_click`이 서비스 레이어가 아닌 라우터에 직접 구현 — 아키텍처 일관성 위반

#### 5. 운영 기능 누락
- **로깅 시스템**: 구조화된 로깅 미구현 (structlog 등)
- **모니터링**: health check만 있고 readiness/liveness 분리 없음, Prometheus 메트릭 없음
- **DB 커넥션 풀 모니터링**: pool 상태 확인 엔드포인트 없음
- **캐싱 전략**: Redis 등 캐싱 레이어 없음 — 분석 데이터 매 요청마다 DB 쿼리
- **백그라운드 작업**: Celery/ARQ 등 비동기 작업 큐 없음

### 프론트엔드

#### 1. 인증 흐름 불완전
- **비밀번호 변경 UI 없음**: 백엔드에 `PUT /auth/password` 있지만 프론트엔드 페이지 없음
- **로그인 상태에서 auth 페이지 접근**: 이미 로그인한 사용자가 `/auth/login`에 접근 시 대시보드 리다이렉트 없음 (middleware.ts에서 미처리)
- **"비밀번호 기억하기"**: 자동 로그인 옵션 없음
- **세션 만료 알림**: 토큰 만료 시 조용히 로그아웃 — 사전 경고 없음

#### 2. UX 미완성
- **Toast 컴포넌트 미사용**: `Toast.tsx`, `showToast()` 구현되어 있지만 `<Toast />` 컴포넌트가 루트 레이아웃에 마운트되지 않음 — ShareModal에서만 호출하고 실제 렌더링 안 됨
- **Header 컴포넌트 미사용**: `Header.tsx` 구현되어 있지만 어디에도 import되지 않음
- **LinkCard 컴포넌트 미사용**: `LinkCard.tsx` 구현되어 있지만 사용처 없음 (links/page.tsx가 자체 구현)
- **ThemeSelector 컴포넌트 미사용**: `ThemeSelector.tsx` 구현되어 있지만 profile/page.tsx에서 직접 구현
- **SocialIconPicker 컴포넌트 미사용**: `SocialIconPicker.tsx` 구현되어 있지만 profile/page.tsx에서 직접 구현
- **ShareModal 컴포넌트 미사용**: `ShareModal.tsx` 구현되어 있지만 어디에도 import되지 않음
- **모바일 반응형 미흡**: DashboardSidebar가 데스크탑 고정 폭(w-56) — 모바일에서 햄버거 메뉴/드로어 없음
- **다크 모드 미지원**: theme 필드 존재하지만 프론트엔드에서 실제 다크모드 CSS 적용 로직 없음
- **드래그앤드롭**: `dragOverIndexRef` 참조 에러 — `links/page.tsx:124`에서 `dragOverIndexRef.current = null` 사용하지만 선언되지 않은 ref
- **로딩 스켈레톤**: 모든 로딩 상태가 `<Spinner />`만 사용 — 스켈레톤 UI 없음

#### 3. 접근성(a11y) 부족
- **ARIA 속성 부족**: 대부분의 인터랙티브 요소에 aria-label 없음
- **키보드 네비게이션**: 모달 포커스 트랩 미구현
- **색상 대비**: 일부 텍스트(`text-gray-300`, `text-gray-400`)가 WCAG AA 기준 미달 가능
- **스크린 리더**: 차트/통계 데이터의 대체 텍스트 없음

#### 4. 성능 이슈
- **번들 최적화**: lucide-react 전체 임포트 대신 tree-shaking 확인 필요
- **이미지 최적화**: 공개 프로필의 아바타가 `<img>` 태그 사용 (Next.js `<Image>` 미사용)
- **메모리 캐시 무한 증가**: `useApi.ts`의 `memoryCache`가 Map으로 무한 증가 — LRU/TTL 없음
- **공개 프로필 방문 기록**: TrackedLink에서 `fetch(..., { method: "POST" })` 호출하지만 실제 백엔드 엔드포인트는 `GET /api/public/links/{id}/click` — **메서드 불일치**

#### 5. 테스트 없음
- 단위 테스트, 통합 테스트, E2E 테스트 모두 없음 (현재 테스트 인프라 구축 중)

---

## 보안 취약점 체크리스트

| 항목 | 상태 | 심각도 | 설명 |
|------|------|--------|------|
| Rate Limiting | 미구현 | **높음** | 로그인 brute-force 방어 없음 |
| JWT Secret 하드코딩 | 위험 | **높음** | 기본값이 코드에 노출, .env 미설정 시 그대로 사용 |
| 이메일 인증 없음 | 미구현 | 중간 | 가짜 이메일로 가입 가능 |
| Token Blacklist 없음 | 미구현 | 중간 | 로그아웃해도 토큰 유효 |
| IP 원본 저장 | 위험 | 중간 | 개인정보 보호법 위반 가능 |
| URL 스키마 검증 부족 | 미흡 | 중간 | javascript: 프로토콜, 내부 IP 등 미차단 |
| CORS 과도 허용 | 미흡 | 낮음 | 운영 시 메서드/헤더 제한 필요 |
| 비밀번호 강도 미흡 | 미흡 | 낮음 | 최소 8자만 검증 |

---

## 추가 개발 추천 기능 (우선순위별)

### 높음 - 핵심 기능 완성

1. **미사용 컴포넌트 정리 또는 통합**
   - Toast를 루트 레이아웃에 마운트
   - Header를 랜딩 페이지 등에 적용
   - LinkCard, ThemeSelector, SocialIconPicker, ShareModal 사용처 연결 또는 제거
   - `dragOverIndexRef` 미선언 버그 수정

2. **Rate Limiting 적용**
   - `slowapi` 또는 커스텀 미들웨어로 로그인/회원가입에 IP 기반 제한

3. **비밀번호 변경 페이지 구현**
   - `/dashboard/settings` 또는 `/dashboard/profile`에 비밀번호 변경 폼 추가
   - 백엔드 `PUT /api/auth/password` 이미 구현됨

4. **TrackedLink 메서드 불일치 수정**
   - 프론트엔드에서 POST로 호출하지만 백엔드는 GET — 둘 중 하나 통일 필요

5. **로그인 상태 auth 페이지 리다이렉트**
   - middleware.ts에서 토큰 존재 시 `/auth/*` → `/dashboard` 리다이렉트 추가

### 중간 - UX/보안 개선

6. **이메일 인증 시스템**
   - 가입 시 인증 이메일 발송, 인증 완료 후 계정 활성화

7. **비밀번호 찾기/재설정**
   - `POST /auth/forgot-password`, `POST /auth/reset-password` API 추가

8. **모바일 반응형 사이드바**
   - 햄버거 메뉴 + 슬라이드 드로어로 모바일 대응

9. **다크 모드 실제 적용**
   - theme 설정에 따른 공개 프로필 다크 테마 CSS 적용

10. **Pagination 구현**
    - 링크 목록, 분석 데이터에 cursor/offset 기반 페이지네이션

11. **계정 삭제(탈퇴) 기능**
    - `DELETE /api/auth/account` + 확인 모달

12. **로그아웃 토큰 무효화**
    - Redis 기반 refresh token blacklist

13. **URL 보안 검증 강화**
    - `javascript:`, `data:` 스키마 차단, 내부 IP 대역 차단

### 낮음 - 부가 기능

14. **프로필 이미지 직접 업로드**
    - S3/Cloudflare R2 연동 파일 업로드 API

15. **링크 썸네일 자동 생성**
    - URL에서 OG 이미지 자동 추출

16. **분석 데이터 Export**
    - CSV/JSON 다운로드 API

17. **링크 카테고리/태그**
    - 링크 그룹핑 기능

18. **커스텀 도메인 연결**
    - 사용자별 커스텀 도메인 매핑

19. **SEO 도구**
    - 공개 프로필 sitemap.xml, robots.txt 자동 생성

20. **실시간 알림**
    - WebSocket으로 클릭 실시간 알림

---

## 추가 참고: API 스키마 요약

### 인증
```
POST /api/auth/register
  Request:  { username: str(3-30), email: EmailStr, password: str(8+), display_name?: str }
  Response: UserResponse (201)

POST /api/auth/login
  Request:  { email: EmailStr, password: str }
  Response: { access_token: str, refresh_token: str, token_type: "bearer" }

POST /api/auth/refresh
  Request:  { refresh_token: str }
  Response: { access_token: str, refresh_token: str, token_type: "bearer" }

GET /api/auth/me
  Headers:  Authorization: Bearer {access_token}
  Response: UserResponse

PUT /api/auth/password
  Headers:  Authorization: Bearer {access_token}
  Request:  { current_password: str, new_password: str(8+) }
  Response: 204 No Content
```

### 링크
```
GET /api/links → LinkResponse[]
POST /api/links → LinkResponse (201)
  Request: { title: str(1-100), url: str(http(s)://, max 2000), description?: str, thumbnail_url?: str }
PUT /api/links/{id} → LinkResponse
  Request: { title?: str, url?: str, description?: str, thumbnail_url?: str, is_active?: bool }
DELETE /api/links/{id} → 204
PUT /api/links/reorder → LinkResponse[]
  Request: [{ id: UUID, position: int }]
PATCH /api/links/{id}/toggle → LinkResponse
```

### 프로필
```
GET /api/profile → ProfileResponse
PUT /api/profile → ProfileResponse
  Request: { display_name?, bio?, avatar_url?, social_links?: {github?,twitter?,...}, theme?, bg_color? }
GET /api/public/{username} → PublicProfileResponse
```

### 분석
```
GET /api/analytics/summary → { total_clicks, total_views, total_links, today_clicks, today_views, click_through_rate }
GET /api/analytics/links → [{ id, title, url, click_count, is_active }]
GET /api/analytics/views?days=7 → { days, total_views, daily: [{ date, view_count, unique_visitors }] }
GET /api/analytics/top-links?limit=5 → [{ id, title, url, click_count, ctr }]
GET /api/analytics/recent-clicks?limit=10 → [{ link_id, title, clicked_at, visitor_ip(masked) }]
```

### 인증 방식
- **JWT HS256**: access token (30분) + refresh token (7일)
- **Bearer Token**: `Authorization: Bearer {access_token}` 헤더
- **자동 갱신**: 401 응답 시 refresh token으로 재발급 시도 (프론트엔드 api-client)
- **로그아웃**: 클라이언트측 토큰 삭제 + `auth:logout` CustomEvent (서버측 무효화 없음)

### DB 모델 관계도
```
User (1) ──→ (N) Link
User (1) ──→ (N) ProfileView
Link (1) ──→ (N) LinkClick
User (1) ──→ (N) LinkClick (via user_id)
```
- 모든 FK에 `ondelete="CASCADE"` 설정
- User 삭제 시 관련 Link, ProfileView, LinkClick 모두 cascade 삭제
