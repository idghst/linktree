// 파일 목적: 랜딩 페이지 (루트 경로 /)
// 주요 기능: 서비스 소개, CTA 버튼 (시작하기/로그인)
// 사용 방법: Next.js App Router 루트 페이지

import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">Linktree</h1>
        <p className="mb-2 text-xl text-gray-600">하나의 링크로 모든 것을 연결하세요</p>
        <p className="mb-8 text-gray-500">
          소셜 미디어, 포트폴리오, 블로그... 당신의 모든 링크를 하나의 페이지에
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.REGISTER}
            className="rounded-xl bg-violet-500 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-violet-600 hover:shadow-lg"
          >
            무료로 시작하기
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="rounded-xl border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
