# CLAUDE.md - backend/app/models

## 역할
SQLAlchemy ORM 모델 정의 폴더. 데이터베이스 테이블 구조를 Python 클래스로 표현하며 모든 모델은 Base를 상속한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | User, Link, ProfileView, LinkClick 일괄 export |
| user.py | User 모델 - UUID PK, username/email unique, theme/bg_color, links/profile_views 관계 |
| link.py | Link 모델 - UUID PK, user_id FK, title/url/position/is_active/click_count |
| analytics.py | ProfileView(방문 기록), LinkClick(클릭 기록) - BigSerial PK, INET IP 추적 |

## 규칙
- 모든 모델은 `app.core.database.Base` 상속
- PK는 UUID(as_uuid=True) 사용 (analytics 제외: BigInteger autoincrement)
- 타임스탬프는 `DateTime(timezone=True)`로 timezone-aware 저장
- 관계(relationship)는 cascade="all, delete-orphan" 설정
- 각 파일 최상단에 3줄 주석 필수

## 관련 폴더
- `../core/database.py` — Base 클래스 소스
- `../schemas/` — 모델 대응 Pydantic 스키마
- `../../alembic/versions/` — 모델 기반 마이그레이션 파일
