// 파일 목적: 계정 설정 페이지 - 비밀번호 변경, 계정 삭제
// 주요 기능: 현재 비밀번호 + 새 비밀번호 입력 폼, 계정 삭제 확인 UI
// 사용 방법: Next.js App Router가 /dashboard/settings 경로에서 렌더링

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/graphql-client";
import { showToast } from "@/components/ui/Toast";
import { authService } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("새 비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast("비밀번호가 변경되었습니다.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError) showToast(err.detail, "error");
      else showToast("비밀번호 변경에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authService.deleteAccount();
      logout();
      router.replace(ROUTES.LOGIN);
    } catch (err) {
      if (err instanceof ApiError) showToast(err.detail, "error");
      else showToast("계정 삭제에 실패했습니다.", "error");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">계정 설정</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">비밀번호 변경</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="current-password" className="text-sm font-medium text-gray-700">
              현재 비밀번호
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-sm font-medium text-gray-700">
              새 비밀번호
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
              새 비밀번호 확인
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" loading={loading}>
              비밀번호 변경
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-red-100">
        <h2 className="mb-1 text-lg font-semibold text-red-700">계정 삭제</h2>
        <p className="mb-4 text-sm text-gray-500">
          계정을 삭제하면 모든 링크, 프로필, 통계 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        {!showDeleteConfirm ? (
          <Button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            계정 삭제
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-700">
              확인을 위해 <span className="font-bold text-red-600">계정삭제</span>를 입력하세요.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="계정삭제"
              className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleDeleteAccount}
                loading={deleteLoading}
                disabled={deleteConfirmText !== "계정삭제"}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300"
              >
                영구 삭제
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
