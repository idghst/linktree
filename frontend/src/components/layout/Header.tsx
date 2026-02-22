// 파일 목적: 사이트 상단 헤더 컴포넌트
// 주요 기능: 로고, 네비게이션 링크, 인증 상태에 따른 버튼 표시
// 사용 방법: <Header /> - app/layout.tsx에서 사용

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="text-xl font-bold text-violet-600">
          Linktree
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href={ROUTES.DASHBOARD} className="text-sm text-gray-600 hover:text-gray-900">
                대시보드
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button size="sm">시작하기</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
