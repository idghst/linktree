# CLAUDE.md - backend/app/services

## 역할
비즈니스 로직 레이어. 라우터에서 분리된 핵심 처리 로직을 담당하며 DB 세션과 스키마를 받아 ORM 모델을 반환한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | 패키지 초기화 |
| auth.py | register(중복확인→User생성), login(비번검증→JWT), refresh_token |
| link.py | list_links, create_link, update_link, delete_link, reorder_links, toggle_link |
| profile.py | get_my_profile, update_profile, get_public_profile(활성 링크 포함) |
| analytics.py | get_summary(총합계), get_link_stats(링크별), get_view_stats(기간별 일별 집계) |

## 규칙
- 모든 함수는 `async def`로 선언, `AsyncSession`을 첫 번째 인자로 받음
- 소유권 검증: 링크 수정/삭제 시 user_id 일치 여부 확인 (ForbiddenException)
- 존재 여부 검증: `scalar_one_or_none()` 사용 후 None이면 NotFoundException
- 각 파일 최상단에 3줄 주석 필수

## 관련 폴더
- `../models/` — 서비스가 다루는 ORM 모델
- `../schemas/` — 입력(Request)/출력(Response) 스키마
- `../routers/` — 서비스 함수를 호출하는 HTTP 핸들러
- `../core/exceptions.py` — NotFoundException, ForbiddenException 등
