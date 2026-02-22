// 파일 목적: 404 페이지 컴포넌트
// 주요 기능: 존재하지 않는 페이지 접근 시 친화적 오류 메시지 표시
// 사용 방법: Next.js App Router가 404 상황에서 자동으로 렌더링

import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
      <Link
        href={ROUTES.HOME}
        className="rounded-lg bg-violet-500 px-6 py-2 text-white hover:bg-violet-600 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
