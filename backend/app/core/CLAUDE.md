# CLAUDE.md - backend/app/core

## 역할
애플리케이션 핵심 설정 모듈. 환경변수, DB 연결, 보안, 예외 처리를 담당한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | 패키지 초기화 |
| config.py | pydantic-settings로 환경변수 파싱 |
| database.py | async SQLAlchemy 엔진, 세션 팩토리 |
| security.py | bcrypt 해싱, JWT 생성/검증 |
| exceptions.py | AppException 계층 (404/400/401/409/403) |
| exception_handlers.py | FastAPI 전역 예외 핸들러 등록 |

## 규칙
- `settings` 객체는 lru_cache로 싱글톤 유지
- DB 엔진은 pool_pre_ping=True로 연결 유효성 확인
- JWT payload: `{"sub": user_id, "type": "access"|"refresh"}`

## 관련 폴더
- `../dependencies/` — core 모듈을 활용하는 의존성
- `../models/` — database.Base를 상속하는 모델
