# CLAUDE.md - backend

## 역할
FastAPI 기반 백엔드 서버. Python 3.12, SQLAlchemy async, Alembic 마이그레이션을 사용한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| Dockerfile | Python 3.12-slim 기반 이미지 빌드 |
| requirements.txt | Python 의존성 패키지 목록 |
| pyproject.toml | 프로젝트 메타데이터, ruff 설정 |
| alembic.ini | Alembic 마이그레이션 설정 |

## 규칙
- Python 3.12 이상 사용
- 모든 DB 작업은 async/await 패턴 사용
- 모든 파일 최상단에 3줄 주석 필수 (목적/기능/사용법)
- `uvicorn app.main:app --host 0.0.0.0 --port 8000`으로 실행

## 관련 폴더
- `app/` — FastAPI 애플리케이션 코드
- `alembic/` — 데이터베이스 마이그레이션
