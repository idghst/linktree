// 파일 목적: 프로필 테마 선택 컴포넌트
// 주요 기능: default/dark/purple/green/sunset 5가지 테마 미리보기 카드로 선택
// 사용 방법: <ThemeSelector value={bgColor} onChange={setBgColor} />

"use client";

import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  value: string;
  onChange: (bgColor: string) => void;
}

interface ThemeOption {
  id: string;
  label: string;
  bgColor: string;
  previewBg: string;
  previewText: string;
  previewBar: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "default",
    label: "기본",
    bgColor: "#ffffff",
    previewBg: "bg-white border border-gray-200",
    previewText: "text-gray-900",
    previewBar: "bg-gray-800",
  },
  {
    id: "dark",
    label: "다크",
    bgColor: "#1a1a2e",
    previewBg: "bg-[#1a1a2e]",
    previewText: "text-gray-100",
    previewBar: "bg-gray-500",
  },
  {
    id: "purple",
    label: "보라",
    bgColor: "#6d28d9",
    previewBg: "bg-gradient-to-br from-purple-700 to-purple-400",
    previewText: "text-white",
    previewBar: "bg-white/70",
  },
  {
    id: "green",
    label: "초록",
    bgColor: "#065f46",
    previewBg: "bg-gradient-to-br from-emerald-800 to-emerald-400",
    previewText: "text-white",
    previewBar: "bg-white/70",
  },
  {
    id: "sunset",
    label: "선셋",
    bgColor: "#ea580c",
    previewBg: "bg-gradient-to-br from-orange-600 to-red-500",
    previewText: "text-white",
    previewBar: "bg-white/70",
  },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {THEMES.map((theme) => {
        const isSelected = value === theme.bgColor;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.bgColor)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-1 transition-all focus:outline-none",
              isSelected
                ? "ring-2 ring-violet-500 ring-offset-2"
                : "ring-1 ring-gray-200 hover:ring-gray-300"
            )}
          >
            {/* 미리보기 카드 */}
            <div
              className={cn(
                "flex h-16 w-16 flex-col items-center justify-center gap-1.5 rounded-lg",
                theme.previewBg
              )}
            >
              <div className={cn("h-2 w-8 rounded-full", theme.previewBar)} />
              <div className={cn("h-1.5 w-6 rounded-full opacity-70", theme.previewBar)} />
              <div className={cn("h-1.5 w-7 rounded-full opacity-50", theme.previewBar)} />
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                isSelected ? "text-violet-600" : "text-gray-600"
              )}
            >
              {theme.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
