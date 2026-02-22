# CLAUDE.md - backend/alembic/versions

## 역할
개별 데이터베이스 마이그레이션 파일 보관 폴더. 각 파일은 스키마 변경사항을 upgrade/downgrade 함수로 표현한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| 001_create_users_table.py | users 테이블 생성 - UUID PK, username/email unique 인덱스 |
| 002_create_links_table.py | links 테이블 생성 - user_id FK, position/click_count 포함 |
| 003_create_analytics_tables.py | profile_views, link_clicks 테이블 생성 - BigSerial PK, INET 타입 |

## 규칙
- 파일명은 `{번호}_{설명}.py` 형식으로 순서를 명확히 표시
- 각 파일 최상단에 3줄 주석 필수 (목적/기능/사용법)
- `revision`, `down_revision`으로 마이그레이션 체인 유지
- upgrade()와 downgrade() 함수를 반드시 쌍으로 구현
- PostgreSQL 전용 타입(UUID, INET) 사용 시 `sqlalchemy.dialects.postgresql` import

## 관련 폴더
- `../` — alembic 환경 설정 (env.py)
- `../../app/models/` — 마이그레이션이 반영하는 ORM 모델
