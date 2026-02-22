// 파일 목적: 프로필 공유 모달 컴포넌트
// 주요 기능: 공개 URL 복사, QR 코드 표시(qrserver.com API), Twitter/카카오 공유 링크
// 사용 방법: <ShareModal username="user" isOpen={open} onClose={() => setOpen(false)} />

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/components/ui/Toast";

interface ShareModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ username, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  /* c8 ignore start */
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `https://linktree.example.com/${username}`;
  /* c8 ignore stop */

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `내 링크 페이지를 확인해보세요!`
  )}&url=${encodeURIComponent(profileUrl)}`;

  const kakaoShareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(profileUrl)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      showToast("링크가 복사되었습니다!", "success");
      /* c8 ignore start */
      setTimeout(() => setCopied(false), 2000);
      /* c8 ignore stop */
    } catch {
      showToast("복사에 실패했습니다.", "error");
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="프로필 공유">
      <div className="flex flex-col gap-5">
        {/* URL 복사 영역 */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">공개 프로필 URL</p>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
            <span className="flex-1 truncate text-sm text-gray-700">{profileUrl}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md bg-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1"
            >
              {copied ? "\uBCF5\uC0AC\uB428 \u2713" : "\uBCF5\uC0AC"}
            </button>
          </div>
        </div>

        {/* QR 코드 */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium text-gray-500">QR 코드</p>
          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`${username} 프로필 QR 코드`}
              width={160}
              height={160}
              className="block"
            />
          </div>
        </div>

        {/* 소셜 공유 */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">소셜 공유</p>
          <div className="flex gap-2">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span>🐦</span>
              Twitter
            </a>
            <a
              href={kakaoShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span>💬</span>
              카카오스토리
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
