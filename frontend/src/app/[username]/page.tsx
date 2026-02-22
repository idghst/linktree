// 파일 목적: 공개 프로필 페이지 - /@username 또는 /username으로 접근 가능
// 주요 기능: 서버 컴포넌트, 공개 프로필 + 활성 링크 표시, 소셜 링크, 공유 버튼, 404 처리
// 사용 방법: Next.js App Router가 /[username] 경로에서 자동 렌더링

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { PublicProfile, SocialLinks } from "@/types/api";
import { ShareButton } from "./ShareButton";
import { TrackedLink } from "./TrackedLink";

interface Props {
  params: Promise<{ username: string }>;
}

async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/public/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "사용자를 찾을 수 없습니다" };
  const seo = profile.seo_settings;
  return {
    title: seo?.title || `${profile.display_name || profile.username} | Linktree`,
    description: seo?.description || profile.bio || `${profile.username}의 링크 페이지`,
    /* c8 ignore start */
    ...(seo?.og_image
      ? { openGraph: { images: [{ url: seo.og_image }] } }
      : {}),
    /* c8 ignore stop */
  };
}

interface SocialIconProps {
  platform: keyof SocialLinks;
  url: string;
}

function SocialIcon({ platform, url }: SocialIconProps) {
  const icons: Record<keyof SocialLinks, ReactNode> = {
    github: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center h-9 w-9 rounded-full bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors shadow-sm"
      aria-label={platform}
    >
      {icons[platform]}
    </a>
  );
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const socialEntries = profile.social_links
    ? (Object.entries(profile.social_links) as [keyof SocialLinks, string | null | undefined][]).filter(
        ([, url]) => url
      )
    : [];

  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ backgroundColor: profile.bg_color || "#f0fdf4" }}
    >
      {/* 프로필 헤더 */}
      <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-md">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-violet-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-md">
            {(profile.display_name || profile.username)[0].toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-gray-600 max-w-sm text-center">{profile.bio}</p>
          )}
        </div>

        {/* 소셜 링크 아이콘 */}
        {socialEntries.length > 0 && (
          <div className="flex items-center gap-2">
            {socialEntries.map(([platform, url]) => (
              <SocialIcon key={platform} platform={platform} url={url as string} />
            ))}
          </div>
        )}

        {/* 공유 버튼 */}
        <ShareButton username={profile.username} />
      </div>

      {/* 링크 목록 */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {profile.links.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-1">아직 등록된 링크가 없습니다.</p>
            <p className="text-gray-300 text-sm">곧 새로운 링크가 추가될 예정입니다.</p>
          </div>
        ) : (
          profile.links.map((link) =>
            link.link_type === 'header' ? (
              <div key={link.id} className="flex items-center gap-3 py-2" data-testid="link-header">
                <div className="flex-1 border-t border-gray-300/60" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {link.title}
                </span>
                <div className="flex-1 border-t border-gray-300/60" />
              </div>
            ) : (
              <TrackedLink key={link.id} link={link} />
            )
          )
        )}
      </div>

      {/* 푸터 */}
      <footer className="mt-12 text-sm text-gray-400">
        Powered by <span className="font-semibold text-violet-600">Linktree</span>
      </footer>
    </main>
  );
}
