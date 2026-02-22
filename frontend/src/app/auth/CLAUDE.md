# CLAUDE.md - frontend/src/app/auth

## 역할
인증 관련 페이지 폴더. 로그인과 회원가입 페이지를 포함하며 인증 성공 시 대시보드로 리다이렉트한다.

## 파일 목록
| 파일명 | 역할 |
|--------|------|
| login/page.tsx | 로그인 페이지 - 이메일/비밀번호 폼, useAuth().login 호출 |
| register/page.tsx | 회원가입 페이지 - username/email/password 폼, useAuth().register 호출 |

## 규칙
- 클라이언트 컴포넌트(`"use client"`) - 폼 상태 관리 필요
- 에러는 `ApiError` 인스턴스 확인 후 `err.detail`로 사용자에게 표시
- 로그인 성공: `/dashboard`로 이동, 회원가입 성공: `/auth/login`으로 이동
- 이미 로그인된 경우 middleware가 `/dashboard`로 리다이렉트

## 관련 폴더
- `../../hooks/useAuth.ts` — login/register 액션
- `../../lib/constants.ts` — ROUTES 상수
