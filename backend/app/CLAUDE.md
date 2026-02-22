# CLAUDE.md - backend/app

## 역할
FastAPI 애플리케이션 패키지. main.py가 진입점이며 모든 서브모듈을 조직한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | 패키지 초기화 |
| main.py | FastAPI 앱 생성, CORS, 라우터 등록 |

## 규칙
- main.py에서 모든 라우터를 `/api` 접두사로 등록
- lifespan 컨텍스트 매니저로 시작/종료 작업 처리
- CORS는 settings.cors_origins_list 사용

## 관련 폴더
- `core/` — 설정, DB, 보안, 예외
- `dependencies/` — FastAPI 의존성 함수
- `models/` — SQLAlchemy ORM 모델
- `schemas/` — Pydantic 스키마
- `services/` — 비즈니스 로직
- `routers/` — HTTP 엔드포인트
