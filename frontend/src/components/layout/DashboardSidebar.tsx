// 파일 목적: 대시보드 사이드바 네비게이션 컴포넌트
// 주요 기능: 대시보드 메뉴 링크 목록 (개요, 링크 관리, 프로필, 계정 설정), 현재 경로 활성화, 모바일 햄버거 메뉴
// 사용 방법: <DashboardSidebar /> - dashboard/layout.tsx에서 사용

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link2, UserCircle, Settings, Menu, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: ROUTES.DASHBOARD, label: "개요", icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_LINKS, label: "링크 관리", icon: Link2 },
  { href: ROUTES.DASHBOARD_PROFILE, label: "프로필 설정", icon: UserCircle },
  { href: ROUTES.DASHBOARD_SETTINGS, label: "계정 설정", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-sm md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      >
        {open ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
      </button>

      {/* 모바일 딤 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 사이드바: 모바일=fixed 슬라이드, 데스크톱=static */}
      <aside
        className={cn(
          "w-56 flex-shrink-0 border-r border-gray-200 bg-white",
          "fixed inset-y-0 left-0 z-40 transition-transform",
          "md:static md:inset-auto md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        {user && (
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ExternalLink className="h-4 w-4" />
            내 프로필 보기
          </a>
        )}
        </nav>
      </aside>
    </>
  );
}
