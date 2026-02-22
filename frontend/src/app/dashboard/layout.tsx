// 파일 목적: 대시보드 레이아웃 - 인증 가드 및 사이드바 포함
// 주요 기능: useAuth로 인증 확인, 미인증 시 /auth/login 리다이렉트, DashboardSidebar
// 사용 방법: Next.js App Router가 /dashboard/* 경로에 자동 적용

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
