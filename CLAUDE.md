# CLAUDE.md - 루트

## 역할
Linktree 클론 프로젝트의 루트 디렉토리. 전체 프로젝트 구성과 Docker 환경 설정을 포함한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| README.md | 프로젝트 소개, 기술 스택, 빠른 시작 가이드 |
| .env.example | 환경변수 예시 파일 (.env로 복사하여 사용) |
| docker-compose.yml | 개발 환경 - postgres, backend, frontend |
| docker-compose.prod.yml | 프로덕션 환경 - nginx 추가, 볼륨 분리 |
| nginx.conf | Nginx 리버스 프록시 설정 |

## 규칙
- `.env` 파일은 절대 git에 커밋하지 않는다
- 모든 서비스는 docker compose로 실행한다
- 개발: `docker compose up --build`, 프로덕션: `docker compose -f docker-compose.prod.yml up -d`

## 관련 폴더
- `backend/` — FastAPI 백엔드 서버
- `frontend/` — Next.js 프론트엔드
