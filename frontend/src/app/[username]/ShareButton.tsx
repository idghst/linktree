// 파일 목적: 프로필 URL 클립보드 복사 버튼 (클라이언트 컴포넌트)
// 주요 기능: URL 복사 후 토스트 알림 표시
// 사용 방법: <ShareButton username="foo" />

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  username: string;
}

export function ShareButton({ username }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const url = `${window.location.origin}/${username}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 실패 시 무시
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors shadow-sm text-sm font-medium"
      aria-label="프로필 링크 복사"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-violet-500" />
          <span className="text-violet-600">복사됨!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>공유</span>
        </>
      )}
    </button>
  );
}
