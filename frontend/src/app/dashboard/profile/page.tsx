// 파일 목적: 프로필 설정 페이지 - 사용자 프로필 정보 조회 및 수정
// 주요 기능: display_name, bio, avatar_url, bg_color, theme, social_links 수정
// 사용 방법: Next.js App Router가 /dashboard/profile 경로에서 렌더링

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profile";
import { authService } from "@/services/auth";
import { ApiError } from "@/lib/graphql-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import type { UpdateProfileRequest, User, SeoSettings } from "@/types/api";

const PRESET_COLORS = [
  { label: "그린", value: "#f0fdf4" },
  { label: "블루", value: "#eff6ff" },
  { label: "퍼플", value: "#faf5ff" },
  { label: "핑크", value: "#fdf2f8" },
  { label: "옐로우", value: "#fefce8" },
  { label: "화이트", value: "#ffffff" },
  { label: "다크", value: "#1f2937" },
];

const THEME_OPTIONS = [
  { label: "라이트", value: "light" },
  { label: "다크", value: "dark" },
  { label: "커스텀", value: "custom" },
];

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    bg_color: "#f0fdf4",
    theme: "light",
    github: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
    facebook: "",
    seo_title: "",
    seo_description: "",
    seo_og_image: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
        bg_color: user.bg_color || "#f0fdf4",
        theme: user.theme || "light",
        github: user.social_links?.github || "",
        twitter: user.social_links?.twitter || "",
        instagram: user.social_links?.instagram || "",
        youtube: user.social_links?.youtube || "",
        linkedin: user.social_links?.linkedin || "",
        tiktok: user.social_links?.tiktok || "",
        facebook: user.social_links?.facebook || "",
        seo_title: user.seo_settings?.title || "",
        seo_description: user.seo_settings?.description || "",
        seo_og_image: user.seo_settings?.og_image || "",
      });
    }
  }, [user]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (feedback) setFeedback(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const seoSettings: SeoSettings = {
      ...(form.seo_title ? { title: form.seo_title } : {}),
      ...(form.seo_description ? { description: form.seo_description } : {}),
      ...(form.seo_og_image ? { og_image: form.seo_og_image } : {}),
    };

    const payload: UpdateProfileRequest = {
      display_name: form.display_name || undefined,
      bio: form.bio || undefined,
      avatar_url: form.avatar_url || undefined,
      bg_color: form.bg_color,
      theme: form.theme,
      social_links: {
        github: form.github || null,
        twitter: form.twitter || null,
        instagram: form.instagram || null,
        youtube: form.youtube || null,
        linkedin: form.linkedin || null,
        tiktok: form.tiktok || null,
        facebook: form.facebook || null,
      },
      seo_settings: seoSettings,
    };

    try {
      const updatedUser: User = await profileService.updateProfile(payload);
      updateUser(updatedUser);
      setFeedback({ type: "success", message: "프로필이 성공적으로 저장되었습니다." });
    } catch {
      setFeedback({ type: "error", message: "저장에 실패했습니다. 다시 시도해주세요." });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      setPwFeedback({ type: "error", message: "새 비밀번호가 일치하지 않습니다." });
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwFeedback({ type: "error", message: "비밀번호는 최소 8자 이상이어야 합니다." });
      return;
    }
    setPwLoading(true);
    setPwFeedback(null);
    try {
      await authService.changePassword({ current_password: pwForm.current, new_password: pwForm.newPw });
      setPwFeedback({ type: "success", message: "비밀번호가 성공적으로 변경되었습니다." });
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setPwFeedback({ type: "error", message: err.detail });
      } else {
        setPwFeedback({ type: "error", message: "비밀번호 변경에 실패했습니다." });
      }
    } finally {
      setPwLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
          <p className="mt-1 text-gray-500">공개 프로필 정보를 수정합니다.</p>
        </div>
        <a
          href={`/@${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          내 프로필 보기
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 아바타 미리보기 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">프로필 사진</h2>
          <div className="flex items-center gap-4">
            <Avatar src={form.avatar_url || null} name={form.display_name || user.username} size="xl" />
            <div className="flex-1">
              <Input
                label="아바타 이미지 URL"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatar_url}
                onChange={(e) => handleChange("avatar_url", e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">URL을 입력하면 왼쪽에 미리보기가 표시됩니다.</p>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>
          <Input
            label="표시 이름"
            placeholder={user.username}
            value={form.display_name}
            onChange={(e) => handleChange("display_name", e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">자기소개</label>
            <textarea
              rows={3}
              placeholder="간단한 자기소개를 입력하세요"
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>

        {/* 테마 설정 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">테마 설정</h2>

          {/* 테마 선택 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">테마</label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange("theme", t.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    form.theme === t.value
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 배경색 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">배경색</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleChange("bg_color", c.value)}
                  title={c.label}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    form.bg_color === c.value ? "border-violet-500 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">직접 입력</label>
              <input
                type="color"
                value={form.bg_color}
                onChange={(e) => handleChange("bg_color", e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-gray-200 p-0.5"
              />
              <span className="text-xs text-gray-400 font-mono">{form.bg_color}</span>
            </div>
          </div>

          {/* 배경색 미리보기 */}
          <div
            className="rounded-lg p-4 text-center text-sm text-gray-500 border border-dashed border-gray-200"
            style={{ backgroundColor: form.bg_color }}
          >
            배경색 미리보기
          </div>
        </div>

        {/* 소셜 링크 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">소셜 링크</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="GitHub URL"
              placeholder="https://github.com/username"
              value={form.github}
              onChange={(e) => handleChange("github", e.target.value)}
            />
            <Input
              label="Twitter / X URL"
              placeholder="https://twitter.com/username"
              value={form.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
            />
            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/username"
              value={form.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
            />
            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/@channel"
              value={form.youtube}
              onChange={(e) => handleChange("youtube", e.target.value)}
            />
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/username"
              value={form.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
            />
            <Input
              label="TikTok URL"
              placeholder="https://tiktok.com/@username"
              value={form.tiktok}
              onChange={(e) => handleChange("tiktok", e.target.value)}
            />
            <Input
              label="Facebook URL"
              placeholder="https://facebook.com/username"
              value={form.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
            />
          </div>
        </div>

        {/* SEO 설정 */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">SEO 설정</h2>
          <Input
            label="SEO 제목"
            placeholder="검색 결과에 표시될 제목"
            value={form.seo_title}
            onChange={(e) => handleChange("seo_title", e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">SEO 설명</label>
            <textarea
              rows={2}
              placeholder="검색 결과에 표시될 설명"
              value={form.seo_description}
              onChange={(e) => handleChange("seo_description", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <Input
            label="OG 이미지 URL"
            placeholder="https://example.com/og-image.jpg"
            value={form.seo_og_image}
            onChange={(e) => handleChange("seo_og_image", e.target.value)}
          />
        </div>

        {/* 피드백 메시지 */}
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "bg-violet-50 text-violet-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            저장하기
          </Button>
        </div>
      </form>

      {/* 비밀번호 변경 */}
      <form onSubmit={handlePasswordChange} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">비밀번호 변경</h2>
        <Input
          label="현재 비밀번호"
          type="password"
          placeholder="현재 비밀번호 입력"
          value={pwForm.current}
          onChange={(e) => setPwForm((prev) => ({ ...prev, current: e.target.value }))}
        />
        <Input
          label="새 비밀번호"
          type="password"
          placeholder="최소 8자"
          value={pwForm.newPw}
          onChange={(e) => setPwForm((prev) => ({ ...prev, newPw: e.target.value }))}
        />
        <Input
          label="새 비밀번호 확인"
          type="password"
          placeholder="새 비밀번호 재입력"
          value={pwForm.confirm}
          onChange={(e) => setPwForm((prev) => ({ ...prev, confirm: e.target.value }))}
        />
        {pwFeedback && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            pwFeedback.type === "success" ? "bg-violet-50 text-violet-700" : "bg-red-50 text-red-600"
          }`}>
            {pwFeedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{pwFeedback.message}</span>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" loading={pwLoading}>
            비밀번호 변경
          </Button>
        </div>
      </form>
    </div>
  );
}
