// 파일 목적: 클릭 추적 + 새 탭 열기 링크 컴포넌트 (클라이언트 컴포넌트)
// 주요 기능: /api/public/links/{id}/click API 호출 후 새 탭에서 URL 열기, is_sensitive 경고 모달
// 사용 방법: <TrackedLink link={link} />

"use client";

import { useState } from "react";
import type { Link } from "@/types/api";

interface TrackedLinkProps {
  link: Link;
}

async function trackClick(linkId: string) {
  try {
    await fetch(`/api/public/links/${linkId}/click`, { method: "GET", redirect: "manual" });
  } catch {
    // 추적 실패는 무시
  }
}

function SensitiveWarningModal({
  onCancel,
  onContinue,
}: {
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-2">주의</h2>
        <p className="text-sm text-gray-600 mb-6">
          이 링크는 민감한 콘텐츠를 포함할 수 있습니다. 계속하시겠습니까?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onContinue}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors"
          >
            계속
          </button>
        </div>
      </div>
    </div>
  );
}

export function TrackedLink({ link }: TrackedLinkProps) {
  const [showWarning, setShowWarning] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (link.is_sensitive) {
      setShowWarning(true);
      return;
    }
    await trackClick(link.id);
    window.open(link.url, "_blank", "noopener,noreferrer");
  }

  async function handleContinue() {
    setShowWarning(false);
    await trackClick(link.id);
    window.open(link.url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <a
        href={link.url}
        onClick={handleClick}
        className="flex items-center justify-between w-full rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm px-5 py-4 text-gray-900 font-medium transition-all hover:shadow-md hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-2 truncate">
          {link.favicon_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.favicon_url} alt="" width={16} height={16} className="flex-shrink-0" />
          )}
          <span className="truncate">{link.title}</span>
        </span>
        <svg
          className="h-4 w-4 flex-shrink-0 text-gray-400 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
      {showWarning && (
        <SensitiveWarningModal
          onCancel={() => setShowWarning(false)}
          onContinue={handleContinue}
        />
      )}
    </>
  );
}
