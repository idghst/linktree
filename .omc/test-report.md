# 테스트 실행 결과 - 2026-02-22

## 백엔드 (pytest - Python 3.14.3 로컬)
- **전체**: 90개 | **통과**: 75개 | **실패**: 15개

| 파일 | 테스트 수 | 통과 | 실패 |
|------|-----------|------|------|
| test_auth.py | 19개 | 17개 | 2개 |
| test_links.py | 26개 | 21개 | 5개 |
| test_analytics.py | 28개 | 22개 | 6개 |
| test_profile.py | 6개 | 4개 | 2개 |
| test_public.py | 9개 | 9개 | 0개 |

### 실패 목록 (15개 - 전부 동일한 원인):
- test_analytics.py: `test_get_summary_unauthenticated`, `test_get_link_stats_unauthenticated`, `test_get_view_stats_unauthenticated`, `test_get_recent_clicks_unauthenticated`, `TestGetProfile::test_get_my_profile_unauthenticated`, `TestUpdateProfile::test_update_profile_unauthenticated`
- test_auth.py: `test_me_unauthenticated`, `test_change_password_unauthenticated`
- test_links.py: `test_list_links_unauthenticated`, `test_create_link_unauthenticated`, `test_delete_link_unauthenticated`, `test_reorder_links_unauthenticated`, `test_toggle_link_unauthenticated`
- test_profile.py: `test_get_my_profile_unauthenticated`, `test_update_profile_unauthenticated`

### 실패 원인:
```
assert response.status_code == 403  # 테스트 기대값
AssertionError: assert 401 == 403   # 실제 응답
```
테스트 코드가 미인증 시 `403`을 기대하나, FastAPI는 HTTP 표준에 따라 `401 Unauthorized` 반환.

## 프론트엔드 (vitest)
- **전체**: 139개 | **통과**: 139개 | **실패**: 0개
- 18개 파일 전체 통과

## 종합 점수: 91.7 / 100점

```
백엔드:      75 / 90  = 83.3% × 50점 = 41.7점
프론트엔드: 139 / 139 = 100%  × 50점 = 50.0점
합계:                                  91.7점
```

## 수정 필요 사항

### 담당 에이전트: 백엔드 테스트 작성 에이전트 (Task #4, #5, #6)

**수정 방법**: 15개 `_unauthenticated` 테스트의 기대 상태코드 수정
- `assert response.status_code == 403` → `assert response.status_code == 401`
- 영향 파일: `tests/test_analytics.py`, `tests/test_auth.py`, `tests/test_links.py`, `tests/test_profile.py`

> 참고: 이전 Docker(Python 3.12) 환경에서는 100점 달성 기록 있음. 현재 실패는 패키지 버전 차이로 인한 HTTP 상태코드 동작 변화일 수 있음.
