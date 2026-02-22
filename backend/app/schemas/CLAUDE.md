# CLAUDE.md - backend/app/schemas

## 역할
Pydantic 스키마 정의 폴더. HTTP 요청/응답 데이터 검증 및 직렬화를 담당하며 ORM 모델과 독립적으로 관리된다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| __init__.py | 패키지 초기화 |
| user.py | RegisterRequest(검증), LoginRequest, UserResponse |
| link.py | CreateLinkRequest, UpdateLinkRequest, LinkResponse, ReorderItem |
| profile.py | UpdateProfileRequest, ProfileResponse, PublicProfileResponse |
| token.py | TokenResponse(access/refresh), RefreshRequest |
| analytics.py | AnalyticsSummary, LinkAnalytics, ViewStats, DailyViewStats |

## 규칙
- 응답 스키마는 `model_config = {"from_attributes": True}` 설정 (ORM 모델 변환 지원)
- 입력 검증은 `@field_validator`로 구현
- username: 3-30자 영문/숫자/언더스코어, URL: http(s)://로 시작 검증
- 각 파일 최상단에 3줄 주석 필수

## 관련 폴더
- `../models/` — 스키마가 반영하는 ORM 모델
- `../routers/` — 스키마를 response_model/request body로 사용
- `../services/` — 스키마 데이터를 받아 비즈니스 로직 처리
