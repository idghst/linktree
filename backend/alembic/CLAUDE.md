# CLAUDE.md - backend/alembic

## 역할
Alembic 데이터베이스 마이그레이션 설정 폴더. async SQLAlchemy 엔진을 사용하여 PostgreSQL 스키마를 버전 관리한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| env.py | 마이그레이션 환경 설정 - async 엔진, 모델 메타데이터 자동 감지 |
| script.py.mako | 새 마이그레이션 파일 생성용 템플릿 |

## 규칙
- 마이그레이션은 `backend/` 디렉토리에서 `alembic upgrade head` 명령으로 실행
- env.py는 DATABASE_URL 환경변수에서 연결 URL을 읽어옴
- 모든 모델은 env.py에서 import하여 메타데이터에 포함시켜야 함 (autogenerate 지원)
- offline 모드와 online(async) 모드 모두 지원

## 관련 폴더
- `versions/` — 개별 마이그레이션 파일
- `../app/models/` — 마이그레이션 대상 ORM 모델
- `../app/core/database.py` — Base 메타데이터 소스
