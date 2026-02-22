# CLAUDE.md - backend/app/dependencies

## 역할
FastAPI 의존성 주입 함수 모음. DB 세션과 인증 사용자 조회를 처리한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | 패키지 초기화 |
| db.py | get_db - AsyncSession yield 의존성 |
| auth.py | get_current_user - Bearer 토큰 검증 |

## 규칙
- `get_db`는 항상 `Depends(get_db)` 형태로 주입
- `get_current_user`는 인증이 필요한 모든 엔드포인트에서 사용
- 세션은 요청 종료 시 자동 close

## 관련 폴더
- `../core/` — security.verify_token, database.AsyncSessionLocal 사용
- `../routers/` — 모든 라우터에서 의존성 주입
