// 파일 목적: 링크 카드 컴포넌트 (공개 프로필 및 대시보드 공통)
// 주요 기능: 링크 제목/URL 도메인/클릭수 표시, 클릭 핸들러, 비활성 상태 표시
// 사용 방법: <LinkCard link={link} onClick={handleClick} />

"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Link } from "@/types/api";

interface LinkCardProps {
  link: Link;
  onClick?: () => void;
  className?: string;
}

function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LinkCard({ link, onClick, className }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        window.open(link.url, "_blank", "noopener,noreferrer");
      }}
      className={cn(
        "flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
        !link.is_active && "opacity-50",
        className
      )}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            "font-medium truncate",
            link.is_active ? "text-gray-900" : "text-gray-400 line-through"
          )}
        >
          {link.title}
        </span>
        <span className="text-xs text-gray-400 truncate">{getDomain(link.url)}</span>
        {link.click_count > 0 && (
          <span className="text-xs text-gray-300 mt-0.5">클릭 {link.click_count}회</span>
        )}
      </div>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400 ml-2" />
    </a>
  );
}
