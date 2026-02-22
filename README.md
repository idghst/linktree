# Linktree 클론

바이오 링크 페이지 서비스 — 하나의 링크로 모든 것을 연결하세요.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| 백엔드 | FastAPI, SQLAlchemy (async), Alembic |
| 데이터베이스 | PostgreSQL 17 |
| 인증 | JWT (access 30분 / refresh 7일) |
| 컨테이너 | Docker, Docker Compose |

## 핵심 기능

- 커스텀 바이오 링크 페이지 (`/@username`)
- 링크 추가/수정/삭제 및 드래그 앤 드롭 순서 변경
- 클릭 수 및 방문자 통계 대시보드
- 테마 및 배경색 커스터마이징
- JWT 기반 인증 (자동 토큰 갱신)

## 서비스 주소

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:8000 |
| API 문서 | http://localhost:8000/api/docs |

## 빠른 시작

```bash
# 1. 환경변수 설정
cp .env.example .env

# 2. 서비스 실행
docker compose up --build

# 3. 헬스체크
curl http://localhost:8000/api/health

# 4. 브라우저에서 확인
open http://localhost:3000
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` — 회원가입
- `POST /api/auth/login` — 로그인
- `POST /api/auth/refresh` — 토큰 갱신
- `GET /api/auth/me` — 내 정보

### 링크 관리
- `GET /api/links` — 링크 목록
- `POST /api/links` — 링크 추가
- `PUT /api/links/{id}` — 링크 수정
- `DELETE /api/links/{id}` — 링크 삭제
- `PUT /api/links/reorder` — 순서 변경
- `PATCH /api/links/{id}/toggle` — 활성화 토글

### 공개 프로필
- `GET /api/public/{username}` — 공개 프로필 조회
- `POST /api/public/links/{link_id}/click` — 클릭 기록 (302 리다이렉트)

### 통계
- `GET /api/analytics/summary` — 요약 통계
- `GET /api/analytics/links` — 링크별 통계
- `GET /api/analytics/views` — 기간별 방문자

## 환경변수

`.env.example`을 참고하여 `.env` 파일을 생성하세요.

## 개발 환경

```bash
# 백엔드만 실행
docker compose up postgres backend

# 프론트엔드 로컬 개발
cd frontend
pnpm install
pnpm dev
```
