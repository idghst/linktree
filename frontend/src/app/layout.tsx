// 파일 목적: Next.js 루트 레이아웃 - 모든 페이지의 공통 HTML 구조
// 주요 기능: 메타데이터, globals.css 적용, Toast 전역 알림
// 사용 방법: Next.js App Router가 자동으로 모든 페이지에 적용

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toast } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Linktree - 나의 링크를 하나로",
  description: "바이오 링크 페이지 서비스 - 하나의 링크로 모든 것을 연결하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {children}
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
