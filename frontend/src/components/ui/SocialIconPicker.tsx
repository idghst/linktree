// 파일 목적: 소셜 플랫폼 선택 및 URL 입력 컴포넌트
// 주요 기능: GitHub/Twitter/Instagram/YouTube/LinkedIn/TikTok/Facebook URL 입력, social_links 객체로 onChange
// 사용 방법: <SocialIconPicker value={socialLinks} onChange={setSocialLinks} />

"use client";

import { cn } from "@/lib/utils";
import type { SocialLinks } from "@/types/api";

interface SocialIconPickerProps {
  value: SocialLinks;
  onChange: (value: SocialLinks) => void;
}

interface Platform {
  key: keyof SocialLinks;
  label: string;
  placeholder: string;
  icon: string;
  color: string;
}

const PLATFORMS: Platform[] = [
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
    icon: "\uD83D\uDC19",
    color: "bg-gray-900 text-white",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    placeholder: "https://twitter.com/username",
    icon: "\uD83D\uDC26",
    color: "bg-black text-white",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/username",
    icon: "\uD83D\uDCF8",
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@channel",
    icon: "\u25B6",
    color: "bg-red-600 text-white",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    icon: "\uD83D\uDCBC",
    color: "bg-blue-700 text-white",
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@username",
    icon: "\uD83C\uDFB5",
    color: "bg-black text-white",
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/username",
    icon: "\uD83D\uDC64",
    color: "bg-blue-600 text-white",
  },
];

export function SocialIconPicker({ value, onChange }: SocialIconPickerProps) {
  function handleChange(key: keyof SocialLinks, url: string) {
    onChange({ ...value, [key]: url || undefined });
  }

  return (
    <div className="flex flex-col gap-3">
      {PLATFORMS.map((platform) => (
        <div key={platform.key} className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
              platform.color
            )}
          >
            {platform.icon}
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-500">{platform.label}</label>
            <input
              type="url"
              value={value[platform.key] ?? ""}
              onChange={(e) => handleChange(platform.key, e.target.value)}
              placeholder={platform.placeholder}
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
