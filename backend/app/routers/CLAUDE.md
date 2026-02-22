# CLAUDE.md - backend/app/routers

## 역할
FastAPI HTTP 엔드포인트 라우터 폴더. 각 도메인별 APIRouter를 정의하고 main.py에서 `/api` 접두사로 등록된다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | 패키지 초기화 |
| auth.py | POST /register(201), POST /login, POST /refresh, GET /me |
| links.py | GET/POST /links, PUT /links/reorder, PUT/DELETE /{id}, PATCH /{id}/toggle |
| profile.py | GET/PUT /profile - 내 프로필 조회 및 수정 |
| analytics.py | GET /analytics/summary, /analytics/links, /analytics/views?days= |
| public.py | GET /public/{username}, POST /{username}/view, GET /links/{id}/click(302) |
| health.py | GET /health - 서버 상태 확인 |

## 규칙
- 각 라우터는 `router = APIRouter()`로 인스턴스 생성
- 인증 필요 엔드포인트는 `Depends(get_current_user)` 사용
- DB 세션은 `Depends(get_db)` 사용
- public.py는 인증 불필요 (공개 프로필, 클릭 추적)
- 각 파일 최상단에 3줄 주석 필수

## 관련 폴더
- `../services/` — 라우터에서 호출하는 비즈니스 로직
- `../schemas/` — request body / response_model 타입
- `../dependencies/` — get_db, get_current_user 의존성
