// 파일 목적: Next.js 미들웨어 - /@username URL 재작성 + 로그인 상태 리다이렉트
// 주요 기능: /@username → /username rewrite, 로그인 상태에서 /auth/* 접근 시 /dashboard 리다이렉트
// 사용 방법: Next.js가 요청마다 자동 실행 (src/middleware.ts 위치)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // /@username → /username rewrite
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/${username}`;
    return NextResponse.rewrite(url);
  }

  // 이미 로그인한 사용자가 /auth/login, /auth/register 접근 시 /dashboard로 리다이렉트
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    const isLoggedIn = request.cookies.get("lt_logged_in")?.value === "1";
    if (isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/@:path*", "/auth/login", "/auth/register"],
};
